from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
import os

# Crear PDF de prueba
c = canvas.Canvas("test_coordenadas.pdf", pagesize=letter)
width, height = letter

# Ruta relativa desde app/api/ hacia app/resources/
ruta_imagen = os.path.join(
    os.path.dirname(__file__), "..", "resources", "certificado_plantilla.jpg"
)

if os.path.exists(ruta_imagen):
    c.drawImage(ruta_imagen, 0, 0, width, height, preserveAspectRatio=False)
    print(f"Imagen cargada desde: {ruta_imagen}")
else:
    print(f"ADVERTENCIA: No se encontró la imagen en {ruta_imagen}")
    print(f"Ruta absoluta buscada: {os.path.abspath(ruta_imagen)}")
    print("Creando PDF solo con cuadrícula")

# Dibujar líneas de referencia
c.setStrokeColorRGB(1, 0, 0)
c.setFont("Helvetica", 8)  # Tamaño original

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
print("PDF creado: test_coordenadas.pdf")
print(f"Ubicación: {os.path.abspath('test_coordenadas.pdf')}")
