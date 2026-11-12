from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose.exceptions import JWTError

from app.api.database import get_db
import app.api.models as models
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """Dependencia de autenticacion: decodifica el JWT, busca el usuario en BD, verifica que este activo, y retorna un dict con user_id, rol y vecino_id."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception

        user_id: int = payload.get("sub")
        rol: str = payload.get("rol")

        if user_id is None or rol is None:
            raise credentials_exception

        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.id == user_id)
            .first()
        )

        if not usuario:
            raise credentials_exception

        if usuario.estado != 1:  # 1 = activo; rechazar usuarios deshabilitados
            raise credentials_exception

        # El rol se lee de la BD, no del token: un rol revocado no sigue vigente
        # hasta que expire el JWT.
        return {
            "user_id": usuario.id,
            "rol": usuario.rol,
            "vecino_id": usuario.vecino_id,
        }

    except JWTError:
        raise credentials_exception


def require_presidente(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Dependencia para endpoints exclusivos del presidente."""
    if current_user["rol"] != "presidente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el presidente puede realizar esta acción",
        )
    return current_user
