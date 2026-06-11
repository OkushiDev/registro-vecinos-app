from pydantic import BaseModel, field_validator
from typing import Optional
import re


class VecinoCreate(BaseModel):
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

    class Config:
        from_attributes = True


class VecinoEdicionSchema(BaseModel):
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
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None
    password: Optional[str] = None

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

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str
    user_id: int
    vecino_id: int
    nombre_completo: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    rol: Optional[str] = None


class UserLogin(BaseModel):
    usuario: str
    password: str


class HistorialSchema(BaseModel):
    usuario: str
    tipo_accion: str
    descripcion_accion: str
