from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.schemas import Token
from app.api.dependencies import get_db, get_current_user
from app.api.utils import registrar_accion, formatear_fecha
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
import app.api.models as models

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Autentica al usuario con username+password, valida estado del usuario y vecino, emite JWT y registra el inicio de sesion en el historial."""
    try:
        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.username == form_data.username)
            .first()
        )

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if usuario.estado != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario deshabilitado. Contacte al administrador.",
            )

        if not verify_password(form_data.password, usuario.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == usuario.vecino_id)
            .first()
        )

        if not vecino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Datos del vecino no encontrados",
            )

        if vecino.estado != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vecino deshabilitado. Contacte al administrador.",
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(usuario.id),
                "rol": usuario.rol,
                "vecino_id": vecino.id,
            },
            expires_delta=access_token_expires,
        )

        nombre_completo = (
            f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno}"
        )

        registrar_accion(
            db=db,
            usuario_id=usuario.id,
            descripcion="Inicio de sesión exitoso",
            tipo="Login",
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "rol": usuario.rol,
            "user_id": usuario.id,
            "vecino_id": vecino.id,
            "nombre_completo": nombre_completo,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la solicitud: {str(e)}",
        )


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna el perfil completo del usuario autenticado y sus datos como vecino."""
    try:
        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == current_user["vecino_id"])
            .first()
        )

        if not vecino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vecino no encontrado"
            )

        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.id == current_user["user_id"])
            .first()
        )

        return {
            "user_id": usuario.id,
            "username": usuario.username,
            "rol": usuario.rol,
            "vecino": {
                "id": vecino.id,
                "nombres": vecino.nombres,
                "apellido_paterno": vecino.apellido_paterno,
                "apellido_materno": vecino.apellido_materno,
                "rut": vecino.rut,
                "numero_socio": vecino.numero_socio,
                "nombre_calle": vecino.nombre_calle,
                "numero_casa": vecino.numero_casa,
                "relacion_propiedad": vecino.relacion_propiedad,
                "telefono": vecino.telefono,
                "email": vecino.email,
                "fecha_registro": formatear_fecha(vecino.fecha_registro),
                "estado": vecino.estado,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener datos del usuario",
        )
