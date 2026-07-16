from fastapi import UploadFile
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime

import app.api.models as models
from app.core.security import get_password_hash

# === CONFIGURACIÓN DE ARCHIVOS ===

UPLOAD_BASE = Path("uploads")
UPLOAD_BASE.mkdir(parents=True, exist_ok=True)

UPLOAD_DIR = UPLOAD_BASE / "documentos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

TIPOS_DOCUMENTO = [
    "cedula_identidad",
    "registro_social_hogares",
    "avaluo_fiscal",
    "boleta_agua",
    "boleta_luz",
    "escritura_casa",
]

TIPOS_DOCUMENTO_LABELS = {
    "cedula_identidad": "Cédula de Identidad",
    "registro_social_hogares": "Registro Social de Hogares",
    "avaluo_fiscal": "Avalúo Fiscal",
    "boleta_agua": "Boleta de Agua",
    "boleta_luz": "Boleta de Luz",
    "escritura_casa": "Escritura de Casa",
}


def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Valida extension y tipo MIME del archivo (no verifica tamano; eso se hace en el endpoint)."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"Solo se aceptan: {', '.join(ALLOWED_EXTENSIONS)}"

    if file_ext == ".pdf":
        if file.content_type != "application/pdf":
            return False, "El archivo debe ser un PDF válido"
    else:
        if not file.content_type.startswith("image/"):
            return False, "El archivo debe ser una imagen válida"

    return True, ""


def registrar_accion(
    db: Session, usuario_id: int, descripcion: str, tipo: str
):
    """Guarda una acción en el historial."""
    try:
        if not usuario_id:
            return
        nueva_accion = models.Historial(
            usuario_id=usuario_id, descripcion=descripcion, tipo_accion=tipo
        )
        db.add(nueva_accion)
        db.commit()
        db.refresh(nueva_accion)
    except Exception:
        pass  # No interrumpir el flujo principal


def generar_password_inicial(rut: str, apellido_paterno: str) -> str:
    """Genera contraseña inicial: apellido_paterno + primeros 4 dígitos del RUT"""
    rut_limpio = rut.replace(".", "").replace("-", "")
    primeros_4_digitos = rut_limpio[:4]
    return f"{apellido_paterno}{primeros_4_digitos}"


def crear_usuario_para_vecino(
    db: Session, vecino: models.Vecino
) -> models.Usuario:
    """Crea un usuario automáticamente para un vecino nuevo."""
    username = vecino.rut.replace(".", "")
    password_inicial = generar_password_inicial(
        vecino.rut, vecino.apellido_paterno
    )
    hashed_password = get_password_hash(password_inicial)

    rol = "presidente" if vecino.numero_socio == 35 else "vecino"  # socio 35 = presidente (definido en seed data)

    nuevo_usuario = models.Usuario(
        username=username,
        hashed_password=hashed_password,
        vecino_id=vecino.id,
        rol=rol,
        estado=vecino.estado,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def formatear_fecha(fecha_obj, fmt="%d-%m-%Y", default="-"):
    """Formatea una fecha de forma segura. Fuente única para vecinos y documentos."""
    if not fecha_obj:
        return default
    if isinstance(fecha_obj, str):
        try:
            fecha_obj = datetime.fromisoformat(fecha_obj.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return fecha_obj  # ya está formateada
    return fecha_obj.strftime(fmt)
