from pydantic import BaseModel, field_validator
from typing import Optional
import re


class VecinoCreate(BaseModel):
    """Schema para crear un nuevo vecino (request body de POST /agregar-vecino/)."""
    nombres: str
    apellido_paterno: str
    apellido_materno: str
    rut: str
    numero_socio: int
    nombre_calle: Optional[str] = None
    numero_casa: Optional[str] = None
    relacion_propiedad: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None

    @field_validator("rut")
    @classmethod
    def validar_rut(cls, v: str) -> str:
        rut_limpio = re.sub(r"[.\-]", "", v).upper()
        if len(rut_limpio) < 8 or len(rut_limpio) > 9:
            raise ValueError("El RUT debe tener 8 o 9 caracteres")
        cuerpo = rut_limpio[:-1]
        dv = rut_limpio[-1]
        if not cuerpo.isdigit():
            raise ValueError("El RUT solo puede contener digitos en el cuerpo")
        if not re.match(r"^[\dK]$", dv):
            raise ValueError("El digito verificador debe ser un numero o K")

        # Algoritmo modulo 11
        suma = 0
        multiplicador = 2
        for digito in reversed(cuerpo):
            suma += int(digito) * multiplicador
            multiplicador = multiplicador + 1 if multiplicador < 7 else 2
        dv_esperado = 11 - (suma % 11)
        dv_calculado = "K" if dv_esperado == 10 else "0" if dv_esperado == 11 else str(dv_esperado)
        if dv != dv_calculado:
            raise ValueError(f"El digito verificador del RUT es invalido (esperado: {dv_calculado})")
        return v


class VecinoEdicionSchema(VecinoCreate):
    """Schema para editar un vecino (request body de PUT /editar-vecino/{id}). Incluye campos opcionales para cambio de password."""
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None


class Token(BaseModel):
    """Schema de respuesta para POST /api/token (login exitoso)."""
    access_token: str
    token_type: str
    rol: str
    user_id: int
    vecino_id: int
    nombre_completo: str
