"""Tests para utilidades: validacion de archivos, schemas, generacion de password."""

from datetime import date, datetime, timezone
import pytest
from fastapi import UploadFile
from io import BytesIO
from pydantic import ValidationError

from app.api.schemas import VecinoEdicionSchema
from app.api.utils import (
    formatear_fecha,
    formatear_fecha_hora,
    validate_file,
    generar_password_inicial,
)


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


class TestFormatearFecha:
    def test_timestamp_utc_a_chile(self):
        fecha = datetime(2026, 11, 13, 1, 49, tzinfo=timezone.utc)
        assert formatear_fecha_hora(fecha) == "12-11-2026 22:49"

    def test_timestamp_chile_invierno(self):
        fecha = datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc)
        assert formatear_fecha_hora(fecha) == "01-06-2026 08:00"

    def test_timestamp_naive_se_asume_utc(self):
        fecha = datetime(2026, 11, 13, 1, 49)
        assert formatear_fecha_hora(fecha) == "12-11-2026 22:49"

    def test_string_iso(self):
        assert (
            formatear_fecha_hora("2026-11-13T01:49:00+00:00")
            == "12-11-2026 22:49"
        )

    def test_fecha_sin_hora_no_cambia(self):
        assert formatear_fecha(date(2004, 10, 21)) == "21-10-2004"
        assert formatear_fecha("21-10-2004") == "21-10-2004"

    def test_timestamp_nulo(self):
        assert formatear_fecha_hora(None) == "-"


class TestVecinoEdicionSchema:
    def test_hereda_validacion_de_rut(self):
        with pytest.raises(ValidationError):
            VecinoEdicionSchema(
                nombres="Ana",
                apellido_paterno="Perez",
                apellido_materno="Soto",
                rut="12345678-0",
                numero_socio=1,
            )

    def test_acepta_campos_de_password(self):
        schema = VecinoEdicionSchema(
            nombres="Ana",
            apellido_paterno="Perez",
            apellido_materno="Soto",
            rut="14306046-2",
            numero_socio=35,
            currentPassword="actual",
            newPassword="nueva",
        )
        assert schema.newPassword == "nueva"


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
