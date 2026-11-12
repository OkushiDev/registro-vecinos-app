from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_presidente
from app.api.utils import formatear_fecha
import app.api.models as models

router = APIRouter(prefix="/historial", tags=["historial"])


@router.get("/")
async def obtener_historial(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_presidente),
):
    """Retorna el historial completo de acciones, con datos del vecino que realizo cada accion. Ordenado por fecha descendente."""
    try:
        resultados = (
            db.query(models.Historial, models.Vecino)
            .join(models.Usuario, models.Historial.usuario_id == models.Usuario.id)
            .join(models.Vecino, models.Usuario.vecino_id == models.Vecino.id)
            .order_by(models.Historial.fecha_accion.desc())
            .all()
        )

        lista_historial = []
        for accion, vecino in resultados:
            lista_historial.append(
                {
                    "id": accion.id,
                    "descripcion_accion": accion.descripcion,
                    "tipo_accion": accion.tipo_accion,
                    "fecha_accion": formatear_fecha(accion.fecha_accion, fmt="%d-%m-%Y %H:%M"),
                    "usuario": f"{vecino.nombres} {vecino.apellido_paterno}",
                }
            )

        return lista_historial

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
