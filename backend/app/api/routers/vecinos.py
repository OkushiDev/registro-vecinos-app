from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.api.schemas import VecinoCreate, VecinoEdicionSchema
from app.api.dependencies import get_db, get_current_user
from app.api.utils import (
    registrar_accion,
    generar_password_inicial,
    crear_usuario_para_vecino,
    formatear_fecha,
)
from app.core.security import verify_password, get_password_hash
import app.api.models as models

router = APIRouter(tags=["vecinos"])


@router.get("/lista-vecinos/")
async def lista_vecinos(db: Session = Depends(get_db)):
    try:
        vecinos = db.query(models.Vecino).all()
        vecinos_formateados = [
            {
                "id": vecino.id,
                "nombres": vecino.nombres,
                "apellido_paterno": vecino.apellido_paterno,
                "apellido_materno": vecino.apellido_materno,
                "rut": vecino.rut,
                "numero_socio": vecino.numero_socio,
                "nombre_calle": vecino.nombre_calle,
                "numero_casa": vecino.numero_casa,
                "relacion_propiedad": vecino.relacion_propiedad,
                "fecha_registro": formatear_fecha(vecino.fecha_registro),
                "fecha_edicion": formatear_fecha(vecino.fecha_edicion),
                "telefono": vecino.telefono,
                "email": vecino.email,
                "estado": vecino.estado,
            }
            for vecino in vecinos
        ]
        return {"vecinos": vecinos_formateados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vecino/{vecino_id}")
async def obtener_vecino(vecino_id: int, db: Session = Depends(get_db)):
    try:
        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == vecino_id)
            .first()
        )
        if not vecino:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        return {
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
            "fecha_edicion": formatear_fecha(vecino.fecha_edicion),
            "estado": vecino.estado,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agregar-vecino/")
async def agregar_vecino(
    vecino: VecinoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        existing_vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.rut == vecino.rut)
            .first()
        )
        if existing_vecino:
            raise HTTPException(
                status_code=400, detail="El RUT ya está registrado"
            )

        existing_numero = (
            db.query(models.Vecino)
            .filter(models.Vecino.numero_socio == vecino.numero_socio)
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400,
                detail="El número de socio ya está registrado",
            )

        nuevo_vecino = models.Vecino(
            nombres=vecino.nombres,
            apellido_paterno=vecino.apellido_paterno,
            apellido_materno=vecino.apellido_materno,
            rut=vecino.rut,
            numero_socio=vecino.numero_socio,
            nombre_calle=vecino.nombre_calle,
            numero_casa=vecino.numero_casa,
            relacion_propiedad=vecino.relacion_propiedad,
            telefono=vecino.telefono,
            email=vecino.email,
        )
        db.add(nuevo_vecino)
        db.commit()
        db.refresh(nuevo_vecino)

        nuevo_usuario = crear_usuario_para_vecino(db, nuevo_vecino)

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=f"Registró al nuevo vecino: {nuevo_vecino.nombres} {nuevo_vecino.apellido_paterno} (RUT: {nuevo_vecino.rut})",
            tipo="Creacion",
        )

        return {
            "message": "Vecino y usuario registrados exitosamente",
            "vecino": {
                "id": nuevo_vecino.id,
                "nombres": nuevo_vecino.nombres,
                "rut": nuevo_vecino.rut,
                "email": nuevo_vecino.email,
            },
            "usuario": {
                "username": nuevo_usuario.username,
                "rol": nuevo_usuario.rol,
                "password_inicial": generar_password_inicial(
                    nuevo_vecino.rut, nuevo_vecino.apellido_paterno
                ),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@router.put("/editar-vecino/{vecino_id}")
async def editar_vecino(
    vecino_id: int,
    payload: VecinoEdicionSchema,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        vecino_existente = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == vecino_id)
            .first()
        )
        if not vecino_existente:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        usuario_asociado = (
            db.query(models.Usuario)
            .filter(models.Usuario.vecino_id == vecino_id)
            .first()
        )

        if payload.currentPassword:
            if not usuario_asociado:
                raise HTTPException(
                    status_code=404, detail="Usuario asociado no encontrado"
                )
            if not verify_password(
                payload.currentPassword, usuario_asociado.hashed_password
            ):
                raise HTTPException(
                    status_code=400,
                    detail="La contraseña actual es incorrecta",
                )

            if payload.newPassword:
                usuario_asociado.hashed_password = get_password_hash(
                    payload.newPassword
                )

        # Validar duplicados
        existing_rut = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.rut == payload.rut,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_rut:
            raise HTTPException(
                status_code=400,
                detail="El RUT ya está registrado en otro vecino",
            )

        existing_numero = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.numero_socio == payload.numero_socio,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400,
                detail="El número de socio ya está registrado en otro vecino",
            )

        # Actualizar campos
        vecino_existente.nombres = payload.nombres
        vecino_existente.apellido_paterno = payload.apellido_paterno
        vecino_existente.apellido_materno = payload.apellido_materno
        vecino_existente.rut = payload.rut
        vecino_existente.numero_socio = payload.numero_socio
        vecino_existente.nombre_calle = payload.nombre_calle
        vecino_existente.numero_casa = payload.numero_casa
        vecino_existente.relacion_propiedad = payload.relacion_propiedad
        vecino_existente.telefono = payload.telefono
        vecino_existente.email = payload.email

        if usuario_asociado:
            nuevo_username = payload.rut.replace(".", "")
            if usuario_asociado.username != nuevo_username:
                usuario_asociado.username = nuevo_username

        db.commit()
        db.refresh(vecino_existente)

        detalles = "Actualización de datos"
        if payload.newPassword:
            detalles += " y cambio de contraseña"

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=detalles,
            tipo="EDICION",
        )

        return {
            "message": "Datos actualizados exitosamente",
            "vecino": {
                "id": vecino_existente.id,
                "nombres": vecino_existente.nombres,
                "rut": vecino_existente.rut,
                "email": vecino_existente.email,
                "telefono": vecino_existente.telefono,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@router.patch("/cambiar-estado-vecino/{vecino_id}")
async def cambiar_estado_vecino(
    vecino_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        vecino_existente = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == vecino_id)
            .first()
        )
        if not vecino_existente:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        nuevo_estado = 0 if vecino_existente.estado == 1 else 1
        estado_texto = "habilitado" if nuevo_estado == 1 else "deshabilitado"
        vecino_existente.estado = nuevo_estado

        usuario_asociado = (
            db.query(models.Usuario)
            .filter(models.Usuario.vecino_id == vecino_id)
            .first()
        )
        if usuario_asociado:
            usuario_asociado.estado = nuevo_estado

        db.commit()
        db.refresh(vecino_existente)

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=f"Cambió estado de {vecino_existente.nombres} {vecino_existente.apellido_paterno} a {estado_texto}",
            tipo="Estado",
        )

        return {
            "message": f"Vecino {estado_texto} exitosamente",
            "vecino": {"id": vecino_existente.id, "estado": vecino_existente.estado},
            "nuevo_estado": nuevo_estado,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@router.get("/siguiente-numero-socio/")
async def siguiente_numero_socio(db: Session = Depends(get_db)):
    try:
        max_numero = (
            db.query(models.Vecino.numero_socio)
            .order_by(models.Vecino.numero_socio.desc())
            .first()
        )
        siguiente_numero = (max_numero[0] + 1) if max_numero and max_numero[0] else 1
        return {"siguiente_numero_socio": siguiente_numero}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
