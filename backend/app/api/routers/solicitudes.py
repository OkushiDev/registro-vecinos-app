from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.api.utils import registrar_accion
import app.api.models as models

router = APIRouter(prefix="/api/solicitudes", tags=["solicitudes"])


@router.get("")
async def obtener_todas_solicitudes(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna todas las solicitudes. Solo para presidente."""
    try:
        if current_user["rol"] != "presidente":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo presidentes pueden ver todas las solicitudes",
            )

        solicitudes = (
            db.query(models.Solicitud)
            .order_by(models.Solicitud.fecha_solicitud.desc())
            .all()
        )

        solicitudes_lista = []
        for sol in solicitudes:
            vecino = sol.vecino
            solicitudes_lista.append(
                {
                    "id": sol.id,
                    "tipo_solicitud": sol.tipo_solicitud,
                    "rut": vecino.rut,
                    "nombre_completo": f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno or ''}".strip(),
                    "fecha_solicitud": sol.fecha_solicitud.isoformat(),
                    "fecha_solicitud_formato": sol.fecha_solicitud.strftime(
                        "%d-%m-%Y %H:%M"
                    ),
                    "estado": sol.estado,
                    "visibilidad": sol.visibilidad,
                    "vecino_id": vecino.id,
                    "numero_socio": vecino.numero_socio,
                }
            )

        return solicitudes_lista

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener solicitudes: {str(e)}",
        )


@router.post("/crear")
async def crear_solicitud(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una solicitud de certificado de residencia para el vecino autenticado. Solo permite una solicitud pendiente a la vez."""
    try:
        if current_user["rol"] not in ["vecino", "presidente"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para solicitar certificados",
            )

        vecino_id = current_user["vecino_id"]

        solicitud_existente = (
            db.query(models.Solicitud)
            .filter(
                models.Solicitud.vecino_id == vecino_id,
                models.Solicitud.estado == "pendiente",
            )
            .first()
        )

        if solicitud_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya tienes una solicitud pendiente. Espera a que sea procesada.",
            )

        nueva_solicitud = models.Solicitud(
            vecino_id=vecino_id,
            tipo_solicitud="certificado_residencia",
            estado="pendiente",
            visibilidad="mostrar",
            fecha_solicitud=datetime.now(),
        )

        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)

        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == vecino_id)
            .first()
        )

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion="Solicitó certificado de residencia",
            tipo="SOLICITUD",
        )

        return {
            "success": True,
            "mensaje": "Solicitud creada exitosamente. El presidente será notificado.",
            "solicitud": {
                "id": nueva_solicitud.id,
                "tipo_solicitud": nueva_solicitud.tipo_solicitud,
                "estado": nueva_solicitud.estado,
                "fecha_solicitud": nueva_solicitud.fecha_solicitud.isoformat(),
                "vecino": {
                    "rut": vecino.rut,
                    "nombre_completo": f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno}",
                },
            },
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear solicitud: {str(e)}",
        )


@router.get("/mi-pendiente")
async def mi_solicitud_pendiente(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna si el vecino autenticado tiene una solicitud pendiente."""
    solicitud = (
        db.query(models.Solicitud)
        .filter(
            models.Solicitud.vecino_id == current_user["vecino_id"],
            models.Solicitud.estado == "pendiente",
        )
        .first()
    )
    return {"tiene_pendiente": solicitud is not None}


@router.get("/notificaciones")
async def obtener_notificaciones(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna notificaciones (solicitudes visibles) para el presidente. Incluye conteo de pendientes."""
    try:
        if current_user["rol"] != "presidente":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo presidentes pueden ver notificaciones",
            )

        solicitudes = (
            db.query(models.Solicitud)
            .filter(models.Solicitud.visibilidad == "mostrar")
            .order_by(models.Solicitud.fecha_solicitud.desc())
            .all()
        )

        pendientes = sum(1 for s in solicitudes if s.estado == "pendiente")

        notificaciones = []
        for sol in solicitudes:
            vecino = sol.vecino
            notificaciones.append(
                {
                    "id": sol.id,
                    "tipo_solicitud": sol.tipo_solicitud,
                    "rut": vecino.rut,
                    "nombre_completo": f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno or ''}".strip(),
                    "fecha_solicitud": sol.fecha_solicitud.isoformat(),
                    "fecha_solicitud_formato": sol.fecha_solicitud.strftime(
                        "%d-%m-%Y %H:%M"
                    ),
                    "estado": sol.estado,
                    "visibilidad": sol.visibilidad,
                    "vecino_id": vecino.id,
                    "numero_socio": vecino.numero_socio,
                }
            )

        return {
            "success": True,
            "notificaciones": notificaciones,
            "pendientes": pendientes,
            "total": len(notificaciones),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener notificaciones: {str(e)}",
        )


@router.post("/crear-por-presidente")
async def crear_solicitud_presidente(
    vecino_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una solicitud de certificado para un vecino especifico (solo presidente)."""
    try:
        if current_user["rol"] != "presidente":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo presidentes pueden crear solicitudes para otros vecinos",
            )

        solicitud_existente = (
            db.query(models.Solicitud)
            .filter(
                models.Solicitud.vecino_id == vecino_id,
                models.Solicitud.estado == "pendiente",
            )
            .first()
        )

        if solicitud_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El vecino ya tiene una solicitud pendiente",
            )

        nueva_solicitud = models.Solicitud(
            vecino_id=vecino_id,
            tipo_solicitud="certificado_residencia",
            estado="pendiente",
            visibilidad="mostrar",
            fecha_solicitud=datetime.now(),
        )

        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=f"Creó solicitud de certificado para vecino ID {vecino_id}",
            tipo="SOLICITUD",
        )

        return {
            "success": True,
            "mensaje": "Solicitud creada exitosamente",
            "solicitud": {"id": nueva_solicitud.id},
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear solicitud: {str(e)}",
        )


@router.patch("/{solicitud_id}/ocultar")
async def ocultar_solicitud(
    solicitud_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Oculta una notificacion de solicitud (visibilidad='oculto'). Solo presidente."""
    if current_user["rol"] != "presidente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado",
        )

    solicitud = (
        db.query(models.Solicitud)
        .filter(models.Solicitud.id == solicitud_id)
        .first()
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.visibilidad = "oculto"
    db.commit()

    registrar_accion(
        db=db,
        usuario_id=current_user["user_id"],
        descripcion=f"Ocultó solicitud ID {solicitud_id}",
        tipo="SOLICITUD",
    )

    return {"success": True, "message": "Notificación ocultada exitosamente"}


@router.patch("/{solicitud_id}/rechazar")
async def rechazar_solicitud(
    solicitud_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rechaza una solicitud (estado='rechazado'). Solo presidente."""
    if current_user["rol"] != "presidente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado",
        )

    solicitud = (
        db.query(models.Solicitud)
        .filter(models.Solicitud.id == solicitud_id)
        .first()
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.estado = "rechazado"
    db.commit()

    registrar_accion(
        db=db,
        usuario_id=current_user["user_id"],
        descripcion=f"Rechazó solicitud ID {solicitud_id}",
        tipo="SOLICITUD",
    )

    return {"success": True, "message": "Solicitud rechazada exitosamente"}


@router.patch("/{solicitud_id}/marcar-realizada")
async def marcar_realizada(
    solicitud_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca una solicitud como realizada (estado='realizado'). Solo presidente."""
    if current_user["rol"] != "presidente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado",
        )

    solicitud = (
        db.query(models.Solicitud)
        .filter(models.Solicitud.id == solicitud_id)
        .first()
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.estado = "realizado"
    db.commit()

    registrar_accion(
        db=db,
        usuario_id=current_user["user_id"],
        descripcion=f"Marcó como realizada solicitud ID {solicitud_id}",
        tipo="SOLICITUD",
    )

    return {"success": True, "message": "Solicitud marcada como realizada"}
