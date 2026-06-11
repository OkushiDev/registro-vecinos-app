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
