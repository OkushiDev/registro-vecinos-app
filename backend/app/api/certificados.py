from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api import models
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime
import os

router = APIRouter()

# Mapeo de números de mes a nombres en español
MESES = {
    1: "enero",
    2: "febrero",
    3: "marzo",
    4: "abril",
    5: "mayo",
    6: "junio",
    7: "julio",
    8: "agosto",
    9: "septiembre",
    10: "octubre",
    11: "noviembre",
    12: "diciembre",
}


def generar_certificado_pdf(vecino: models.Vecino) -> BytesIO:
    """
    Genera un PDF con el certificado de residencia usando una imagen de plantilla
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Ruta a la imagen de plantilla
    ruta_imagen = os.path.join(
        os.path.dirname(__file__), "..", "resources", "certificado_plantilla.jpg"
    )

    # Verificar si existe la imagen
    if os.path.exists(ruta_imagen):
        c.drawImage(
            ruta_imagen,
            x=0,
            y=0,
            width=width,
            height=height,
            preserveAspectRatio=False,  # Ajustar a toda la página
        )
    else:
        print(f"ADVERTENCIA: No se encontró la imagen en {ruta_imagen}")
        c.setFillColorRGB(1, 1, 1)
        c.rect(0, 0, width, height, fill=True)

    # === DATOS DEL VECINO (SEPARADOS) ===
    nombres = vecino.nombres
    apellidos = f"{vecino.apellido_paterno} {vecino.apellido_materno}".strip()
    rut = vecino.rut
    domicilio = f"{vecino.nombre_calle} N° {vecino.numero_casa}"
    numero_socio = vecino.numero_socio

    # Fecha SEPARADA: día, mes, año (2 dígitos)
    fecha_actual = datetime.now()
    dia = str(fecha_actual.day)  # "24"
    mes_nombre = MESES[fecha_actual.month]  # "noviembre"
    anio_corto = str(fecha_actual.year)[-2:]  # "25" (últimos 2 dígitos de 2025)

    # === SUPERPONER LOS DATOS EN LAS COORDENADAS ===
    c.setFillColorRGB(0, 0, 0)  # Color negro

    # NOMBRES
    c.setFont("Helvetica-Bold", 12)
    c.drawString(11 * cm, 17 * cm, nombres)

    # APELLIDOS
    c.setFont("Helvetica-Bold", 12)
    c.drawString(11 * cm, 16 * cm, apellidos)

    # RUT
    c.setFont("Helvetica", 11)
    c.drawString(11 * cm, 15 * cm, rut)

    # DOMICILIO
    c.drawString(11 * cm, 14 * cm, domicilio)

    # NÚMERO DE SOCIO
    c.drawString(11 * cm, 13 * cm, str(numero_socio))

    # FECHA - DÍA
    c.drawString(10 * cm, 8.5 * cm, dia)  # 👈 CAMBIA COORDENADAS

    # FECHA - MES
    c.drawString(12 * cm, 8.5 * cm, mes_nombre)  # 👈 CAMBIA COORDENADAS

    # FECHA - AÑO (2 dígitos)
    c.drawString(16.5 * cm, 5 * cm, anio_corto)  # 👈 CAMBIA COORDENADAS

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer


@router.get("/generar-certificado/{vecino_id}")
async def generar_certificado(vecino_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para generar un certificado de residencia en PDF
    """
    # Buscar el vecino
    vecino = db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()

    if not vecino:
        raise HTTPException(status_code=404, detail="Vecino no encontrado")

    # Verificar que el vecino esté activo
    if vecino.estado != 1:
        raise HTTPException(
            status_code=400,
            detail="No se puede generar certificado para un vecino inactivo",
        )

    print(f"Generando certificado para:")
    print(f"  Nombres: {vecino.nombres}")
    print(f"  Apellidos: {vecino.apellido_paterno} {vecino.apellido_materno}")
    print(f"  RUT: {vecino.rut}")
    print(f"  Domicilio: {vecino.nombre_calle} N° {vecino.numero_casa}")
    print(f"  N° Socio: {vecino.numero_socio}")
    print(
        f"  Fecha: {datetime.now().day} de {MESES[datetime.now().month]} de {str(datetime.now().year)[-2:]}"
    )

    # Generar el PDF
    pdf_buffer = generar_certificado_pdf(vecino)

    # Nombre del archivo
    nombre_archivo = f"Certificado_Residencia_{vecino.rut.replace('-', '_')}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"},
    )
