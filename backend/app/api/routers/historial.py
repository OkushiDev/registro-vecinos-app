from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.schemas import HistorialSchema
from app.api.dependencies import get_db, get_current_user
from app.api.utils import registrar_accion, formatear_fecha
import app.api.models as models

router = APIRouter(prefix="/historial", tags=["historial"])


@router.get("/")
async def obtener_historial(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
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


@router.post("/", status_code=201)
async def crear_registro_historial(
    item: HistorialSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=item.descripcion_accion,
            tipo=item.tipo_accion,
        )
        return {"message": "Historial registrado exitosamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
