from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api.dependencies import get_current_user
from app.api.utils import registrar_accion
from app.api import models
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from datetime import datetime, timedelta
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
    Genera un PDF con el certificado de residencia sobreescribiendo datos sobre una plantilla PDF.
    Retorna un BytesIO con el PDF generado.
    Lanza HTTPException 500 si no se encuentra la plantilla.
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

    # Fecha actual (creación del certificado)
    fecha_creacion = datetime.now()

    # === FECHA DE CREACIÓN (SEPARADA) ===
    dia_creacion = str(fecha_creacion.day)
    mes_creacion = MESES[fecha_creacion.month]
    anio_creacion_corto = str(fecha_creacion.year)[-2:]

    # === FECHA DE VIGENCIA (30 días después) ===
    fecha_vigencia = fecha_creacion + timedelta(days=30)
    dia_vigencia = str(fecha_vigencia.day)
    mes_vigencia = MESES[fecha_vigencia.month]
    anio_vigencia_corto = str(fecha_vigencia.year)[-2:]

    # === CREAR CAPA DE TEXTO ===
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    width, height = letter

    # CONFIGURACIÓN UNIFORME DE FUENTE
    can.setFillColorRGB(0, 0, 0)  # Color negro
    can.setFont("Helvetica", 11)  # Fuente uniforme para todos los campos

    # NOMBRES
    can.drawString(7 * cm, 19.3 * cm, nombres)

    # APELLIDOS
    can.drawString(7 * cm, 18.6 * cm, apellidos)

    # RUT
    can.drawString(7 * cm, 17.9 * cm, rut)

    # DOMICILIO
    can.drawString(7 * cm, 17.1 * cm, domicilio)

    # NÚMERO DE SOCIO
    can.drawString(9 * cm, 16.5 * cm, str(numero_socio))

    # === FECHA DE CREACIÓN ===
    # DÍA
    can.drawString(7 * cm, 12.2 * cm, dia_creacion)
    # MES
    can.drawString(9 * cm, 12.2 * cm, mes_creacion)
    # AÑO (2 dígitos)
    can.drawString(14.1 * cm, 12.2 * cm, anio_creacion_corto)

    # === FECHA DE VIGENCIA (30 días después) ===
    # Coordenadas en la plantilla PDF para la fecha de vigencia
    # Ajustar si se modifica la plantilla

    # DÍA VIGENCIA
    can.drawString(4.5 * cm, 1.9 * cm, dia_vigencia)
    # MES VIGENCIA
    can.drawString(7.4 * cm, 1.9 * cm, mes_vigencia)
    # AÑO VIGENCIA (2 dígitos)
    can.drawString(11.55 * cm, 1.9 * cm, anio_vigencia_corto)
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
async def generar_certificado(
    vecino_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
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

    # debug: datos del certificado generado
    print(f"Generando certificado para:")
    print(f"  Nombres: {vecino.nombres}")
    print(f"  Apellidos: {vecino.apellido_paterno} {vecino.apellido_materno}")
    print(f"  RUT: {vecino.rut}")
    print(f"  Domicilio: {vecino.nombre_calle} N° {vecino.numero_casa}")
    print(f"  N° Socio: {vecino.numero_socio}")

    # Generar el PDF
    pdf_buffer = generar_certificado_pdf(vecino)

    # === FORMATEAR NOMBRE DEL ARCHIVO ===
    # Obtener fecha actual para el nombre del archivo
    fecha_actual = datetime.now()

    # Formato: DDMMAA (01 enero 2025 = 010125)
    fecha_formateada = fecha_actual.strftime("%d%m%y")

    # Limpiar el RUT (quitar puntos y guión)
    rut_limpio = vecino.rut.replace(".", "").replace("-", "")

    # Nombre del archivo: Certificado_Residencia_12345678_010125.pdf
    nombre_archivo = f"C_Residencia_{rut_limpio}_{fecha_formateada}.pdf"

    # debug: nombre del archivo generado y fecha de vigencia
    print(f"  Nombre archivo: {nombre_archivo}")
    print(
        f"  Fecha vigencia: {(fecha_actual + timedelta(days=30)).strftime('%d-%m-%Y')}"
    )

    registrar_accion(
        db=db,
        usuario_id=current_user["user_id"],
        descripcion=f"Generó certificado de residencia para {vecino.nombres} {vecino.apellido_paterno}",
        tipo="CERTIFICADO",
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}"'},
    )
