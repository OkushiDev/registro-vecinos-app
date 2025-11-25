from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api import models
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader, PdfWriter
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
    Genera un PDF con el certificado de residencia usando un PDF como plantilla
    """
    # Ruta al PDF plantilla
    ruta_plantilla = os.path.join(
        os.path.dirname(__file__), "..", "resources", "certificado_plantilla.pdf"
    )

    # Verificar si existe el PDF plantilla
    if not os.path.exists(ruta_plantilla):
        raise HTTPException(
            status_code=500,
            detail=f"No se encontró el archivo de plantilla en {ruta_plantilla}",
        )

    # === DATOS DEL VECINO (SEPARADOS) ===
    nombres = vecino.nombres
    apellidos = f"{vecino.apellido_paterno} {vecino.apellido_materno}".strip()
    rut = vecino.rut
    domicilio = f"{vecino.nombre_calle} N° {vecino.numero_casa}"
    numero_socio = vecino.numero_socio

    # Fecha SEPARADA: día, mes, año (2 dígitos)
    fecha_actual = datetime.now()
    dia = str(fecha_actual.day)
    mes_nombre = MESES[fecha_actual.month]
    anio_corto = str(fecha_actual.year)[-2:]

    # === CREAR CAPA DE TEXTO ===
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    width, height = letter

    can.setFillColorRGB(0, 0, 0)  # Color negro

    # NOMBRES (ajusta las coordenadas según tu plantilla)
    can.setFont("Helvetica-Bold", 12)
    can.drawString(11 * cm, 17 * cm, nombres)

    # APELLIDOS
    can.setFont("Helvetica-Bold", 12)
    can.drawString(11 * cm, 16 * cm, apellidos)

    # RUT
    can.setFont("Helvetica", 11)
    can.drawString(11 * cm, 15 * cm, rut)

    # DOMICILIO
    can.drawString(11 * cm, 14 * cm, domicilio)

    # NÚMERO DE SOCIO
    can.drawString(11 * cm, 13 * cm, str(numero_socio))

    # FECHA - DÍA
    can.drawString(5 * cm, 5 * cm, dia)

    # FECHA - MES
    can.drawString(7 * cm, 5 * cm, mes_nombre)

    # FECHA - AÑO (2 dígitos)
    can.drawString(12 * cm, 5 * cm, anio_corto)

    can.save()

    # === COMBINAR PDF PLANTILLA CON DATOS ===
    packet.seek(0)

    # Leer la plantilla
    plantilla_pdf = PdfReader(ruta_plantilla)
    nueva_capa = PdfReader(packet)

    # Crear el PDF final
    output = PdfWriter()

    # Obtener la primera página de la plantilla
    pagina_plantilla = plantilla_pdf.pages[0]

    # Superponer la capa con los datos
    pagina_plantilla.merge_page(nueva_capa.pages[0])

    # Agregar al output
    output.add_page(pagina_plantilla)

    # Escribir el resultado en un buffer
    resultado = BytesIO()
    output.write(resultado)
    resultado.seek(0)

    return resultado


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

    # Generar el PDF
    pdf_buffer = generar_certificado_pdf(vecino)

    # Nombre del archivo
    nombre_archivo = f"Certificado_Residencia_{vecino.rut.replace('-', '_')}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"},
    )
