from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api import models
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
from datetime import datetime
import os

router = APIRouter()


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
        # Dibujar la imagen como fondo
        # Ajusta el tamaño según tu imagen (letter = 8.5" x 11")
        c.drawImage(
            ruta_imagen,
            x=0,
            y=0,
            width=width,
            height=height,
            preserveAspectRatio=True,
            mask="auto",
        )
    else:
        print(f"ADVERTENCIA: No se encontró la imagen en {ruta_imagen}")
        # Si no hay imagen, dibujar un rectángulo de fondo blanco
        c.setFillColorRGB(1, 1, 1)
        c.rect(0, 0, width, height, fill=True)

    # === AHORA SUPERPONER LOS DATOS ===
    # Ajusta las coordenadas (x, y) según donde quieras que aparezcan en tu imagen

    # Nombre completo
    nombre_completo = (
        f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno}".strip()
    )
    c.setFont("Helvetica-Bold", 14)
    c.setFillColorRGB(0, 0, 0)  # Negro
    c.drawString(1.5 * inch, height - 4 * inch, nombre_completo)

    # RUT
    c.setFont("Helvetica", 12)
    c.drawString(1.5 * inch, height - 4.4 * inch, f"RUT: {vecino.rut}")

    # Dirección
    direccion = f"{vecino.nombre_calle} N° {vecino.numero_casa}"
    c.drawString(1.5 * inch, height - 4.8 * inch, f"Domicilio: {direccion}")

    # Relación con la propiedad
    c.drawString(
        1.5 * inch, height - 5.2 * inch, f"Relación: {vecino.relacion_propiedad}"
    )

    # Número de socio
    c.drawString(1.5 * inch, height - 5.6 * inch, f"N° Socio: {vecino.numero_socio}")

    # Fecha de emisión (ajusta la posición según tu plantilla)
    fecha_hoy = datetime.now().strftime("%d de %B de %Y")
    c.drawString(1.5 * inch, height - 9 * inch, f"Fecha: {fecha_hoy}")

    # Si tu imagen YA tiene la firma y timbre, no necesitas agregar nada más
    # Si quieres agregar texto adicional sobre la firma:
    # c.setFont("Helvetica", 10)
    # c.drawCentredString(width / 2, 1.5 * inch, "Nombre del Presidente")

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

    # Generar el PDF
    pdf_buffer = generar_certificado_pdf(vecino)

    # Nombre del archivo
    nombre_archivo = f"Certificado_Residencia_{vecino.rut.replace('-', '_')}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={nombre_archivo}"},
    )
