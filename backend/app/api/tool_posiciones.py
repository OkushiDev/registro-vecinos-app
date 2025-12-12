from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
import os

# Ruta al PDF plantilla
ruta_plantilla = os.path.join(
    os.path.dirname(__file__), "..", "resources", "certificado_plantilla.pdf"
)

if not os.path.exists(ruta_plantilla):
    print(f"ERROR: No se encontró el archivo en {ruta_plantilla}")
    print(f"Ruta absoluta: {os.path.abspath(ruta_plantilla)}")
    exit(1)

# Crear capa con la cuadrícula
packet = BytesIO()
c = canvas.Canvas(packet, pagesize=letter)
width, height = letter

# Dibujar líneas de referencia
c.setStrokeColorRGB(1, 0, 0)  # Rojo
c.setFont("Helvetica", 8)

# Líneas horizontales cada centímetro
num_lineas_y = int(height / cm) + 1
for i in range(num_lineas_y):
    y = i * cm
    c.line(0, y, width, y)
    c.drawString(10, y + 5, f"{i}cm")

# Líneas verticales cada centímetro
num_lineas_x = int(width / cm) + 1
for i in range(num_lineas_x):
    x = i * cm
    c.line(x, 0, x, height)
    c.drawString(x + 5, 10, f"{i}cm")

c.save()

# Combinar con el PDF plantilla
packet.seek(0)

plantilla_pdf = PdfReader(ruta_plantilla)
cuadricula = PdfReader(packet)

output = PdfWriter()

# Obtener la primera página de la plantilla
pagina_plantilla = plantilla_pdf.pages[0]

# Superponer la cuadrícula
pagina_plantilla.merge_page(cuadricula.pages[0])

# Agregar al output
output.add_page(pagina_plantilla)

# Guardar el resultado
with open("test_coordenadas.pdf", "wb") as output_file:
    output.write(output_file)

print("PDF creado: test_coordenadas.pdf")
print(f"Ubicación: {os.path.abspath('test_coordenadas.pdf')}")
print("Abre el PDF para ver tu plantilla con la cuadrícula de coordenadas")
