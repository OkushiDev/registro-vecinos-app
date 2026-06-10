"""Tests para utilidades: validacion de archivos, schemas, generacion de password."""

from fastapi import UploadFile
from io import BytesIO
import pytest

from app.api.utils import validate_file, generar_password_inicial, MAX_FILE_SIZE


class TestValidateFile:
    def test_valid_pdf(self):
        file = UploadFile(
            filename="documento.pdf",
            file=BytesIO(b"dummy"),
            headers={"content-type": "application/pdf"},
        )
        valid, msg = validate_file(file)
        assert valid
        assert msg == ""

    def test_valid_png(self):
        file = UploadFile(
            filename="foto.png",
            file=BytesIO(b"dummy"),
            headers={"content-type": "image/png"},
        )
        valid, _ = validate_file(file)
        assert valid

    def test_invalid_extension(self):
        file = UploadFile(
            filename="malware.exe",
            file=BytesIO(b"dummy"),
            headers={"content-type": "application/octet-stream"},
        )
        valid, msg = validate_file(file)
        assert not valid
        assert "Solo se aceptan" in msg

    def test_pdf_with_wrong_mime(self):
        file = UploadFile(
            filename="doc.pdf",
            file=BytesIO(b"dummy"),
            headers={"content-type": "image/png"},
        )
        valid, msg = validate_file(file)
        assert not valid
        assert "PDF válido" in msg


class TestGenerarPassword:
    def test_password_format(self):
        pwd = generar_password_inicial("14306046-2", "Benavides")
        assert pwd == "Benavides1430"

    def test_with_dots(self):
        pwd = generar_password_inicial("12.345.678-9", "Perez")
        assert pwd == "Perez1234"

    def test_short_rut(self):
        pwd = generar_password_inicial("12-3", "Lopez")
        assert pwd == "Lopez123"
