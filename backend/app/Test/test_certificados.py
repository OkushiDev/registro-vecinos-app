"""Test de generación de certificados: verifica que la plantilla y pypdf funcionen juntos."""

from types import SimpleNamespace

from pypdf import PdfReader

from app.api.certificados import generar_certificado_pdf


def test_generar_certificado_pdf():
    vecino = SimpleNamespace(
        nombres="Ana",
        apellido_paterno="Perez",
        apellido_materno="Soto",
        rut="12345678-9",
        nombre_calle="Calle Principal",
        numero_casa="123",
        numero_socio=7,
    )

    pdf = generar_certificado_pdf(vecino)
    contenido = pdf.read()

    assert contenido.startswith(b"%PDF")
    assert len(contenido) > 1000

    pdf.seek(0)
    reader = PdfReader(pdf)
    assert len(reader.pages) == 1
    assert "Ana" in (reader.pages[0].extract_text() or "")
