import uuid
import os
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.api.dependencies import get_db, get_current_user
from app.api.utils import (
    UPLOAD_DIR,
    TIPOS_DOCUMENTO,
    TIPOS_DOCUMENTO_LABELS,
    validate_file,
    MAX_FILE_SIZE,
    registrar_accion,
    formatear_fecha_hora,
)
import app.api.models as models

router = APIRouter(prefix="/api/documentos", tags=["documentos"])


@router.get("/tipos")
async def obtener_tipos_documento():
    """Endpoint publico: retorna la lista estatica de tipos de documento disponibles."""
    return {
        "tipos": [
            {"value": value, "label": label}
            for value, label in TIPOS_DOCUMENTO_LABELS.items()
        ]
    }


@router.post("/subir")
async def subir_documento(
    file: UploadFile = File(...),
    tipo_documento: str = Form(...),
    descripcion: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sube un documento (PDF/PNG/JPG, max 5MB) asociado al vecino autenticado. Lo guarda en disco y registra en BD."""
    try:
        if tipo_documento not in TIPOS_DOCUMENTO:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de documento inválido. Debe ser uno de: {', '.join(TIPOS_DOCUMENTO)}",
            )

        es_valido, mensaje_error = validate_file(file)
        if not es_valido:
            raise HTTPException(status_code=400, detail=mensaje_error)

        # Leer como máximo un byte de más: evita cargar un archivo enorme en memoria
        contenido = await file.read(MAX_FILE_SIZE + 1)
        tamanio = len(contenido)

        if tamanio > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo muy grande. Máximo {MAX_FILE_SIZE / 1024 / 1024}MB",
            )

        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_ext}"

        vecino_dir = UPLOAD_DIR / str(current_user["vecino_id"])
        vecino_dir.mkdir(parents=True, exist_ok=True)

        file_path = vecino_dir / unique_filename
        with open(file_path, "wb") as buffer:
            buffer.write(contenido)

        nuevo_documento = models.Documento(
            vecino_id=current_user["vecino_id"],
            tipo_documento=tipo_documento,
            nombre_archivo=file.filename,
            ruta_archivo=str(file_path),
            tipo_archivo=file.content_type,
            tamanio=tamanio,
            descripcion=descripcion,
            fecha_subida=datetime.now(timezone.utc),
        )

        db.add(nuevo_documento)
        db.commit()
        db.refresh(nuevo_documento)

        registrar_accion(
            db=db,
            usuario_id=current_user["user_id"],
            descripcion=f"Subió documento: {file.filename}",
            tipo="DOCUMENTO",
        )

        return {
            "message": "Documento subido exitosamente",
            "documento": {
                "tipo_documento": nuevo_documento.tipo_documento,
                "nombre_archivo": nuevo_documento.nombre_archivo,
                "tipo_archivo": nuevo_documento.tipo_archivo,
                "tamanio": nuevo_documento.tamanio,
                "descripcion": nuevo_documento.descripcion,
                "fecha_subida": str(nuevo_documento.fecha_subida),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mis-documentos")
async def listar_mis_documentos(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna los documentos del vecino autenticado que aun no han sido eliminados (estado=1)."""
    documentos = (
        db.query(models.Documento)
        .filter(
            models.Documento.vecino_id == current_user["vecino_id"],
            models.Documento.estado == 1,
        )
        .order_by(models.Documento.fecha_subida.desc())
        .all()
    )

    return {
        "documentos": [
            {
                "id": doc.id,
                "tipo_documento": doc.tipo_documento,
                "nombre_archivo": doc.nombre_archivo,
                "tipo_archivo": doc.tipo_archivo,
                "tamanio": doc.tamanio,
                "descripcion": doc.descripcion,
                "fecha_subida": formatear_fecha_hora(doc.fecha_subida, default=""),
            }
            for doc in documentos
        ]
    }


@router.delete("/{documento_id}")
async def eliminar_documento(
    documento_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Eliminacion logica (estado=0) de un documento del vecino autenticado. El archivo fisico no se borra del disco."""
    documento = (
        db.query(models.Documento)
        .filter(
            models.Documento.id == documento_id,
            models.Documento.vecino_id == current_user["vecino_id"],
        )
        .first()
    )

    if not documento:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    documento.estado = 0
    db.commit()

    registrar_accion(
        db=db,
        usuario_id=current_user["user_id"],
        descripcion=f"Eliminó documento ID: {documento_id}",
        tipo="ELIMINACION",
    )

    return {"message": "Documento eliminado exitosamente"}


@router.get("/vecino/{vecino_id}")
async def obtener_documentos_vecino(
    vecino_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna los documentos de un vecino especifico. Solo el presidente o el propio vecino pueden acceder."""
    try:
        if (
            current_user["rol"] != "presidente"
            and current_user.get("vecino_id") != vecino_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver documentos de otros vecinos",
            )

        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == vecino_id)
            .first()
        )
        if not vecino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vecino no encontrado",
            )

        documentos = (
            db.query(models.Documento)
            .filter(
                models.Documento.vecino_id == vecino_id,
                models.Documento.estado == 1,
            )
            .order_by(models.Documento.fecha_subida.desc())
            .all()
        )

        documentos_lista = [
            {
                "id": doc.id,
                "vecino_id": doc.vecino_id,
                "tipo_documento": TIPOS_DOCUMENTO_LABELS.get(
                    doc.tipo_documento, doc.tipo_documento
                ),
                "tipo_documento_value": doc.tipo_documento,
                "nombre_archivo": doc.nombre_archivo,
                "descripcion": doc.descripcion or "",
                "fecha_subida": formatear_fecha_hora(doc.fecha_subida, default=None),
                "tipo_archivo": doc.tipo_archivo or None,
                "tamanio": doc.tamanio or None,
            }
            for doc in documentos
        ]

        return {
            "success": True,
            "vecino": {
                "id": vecino.id,
                "nombres": vecino.nombres,
                "apellido_paterno": vecino.apellido_paterno,
                "apellido_materno": vecino.apellido_materno,
                "rut": vecino.rut,
                "numero_socio": vecino.numero_socio,
            },
            "documentos": documentos_lista,
            "total": len(documentos_lista),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener documentos: {str(e)}",
        )


@router.get("/descargar/{documento_id}")
async def descargar_documento(
    documento_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Descarga un archivo de documento por su ID. Solo el presidente o el dueno del documento pueden descargar."""
    try:
        documento = (
            db.query(models.Documento)
            .filter(
                models.Documento.id == documento_id,
                models.Documento.estado == 1,
            )
            .first()
        )

        if not documento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento no encontrado",
            )

        if (
            current_user["rol"] != "presidente"
            and current_user.get("vecino_id") != documento.vecino_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para descargar este documento",
            )

        if not os.path.exists(documento.ruta_archivo):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Archivo no encontrado en el servidor",
            )

        return FileResponse(
            path=documento.ruta_archivo,
            filename=documento.nombre_archivo,
            media_type="application/octet-stream",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al descargar documento: {str(e)}",
        )
