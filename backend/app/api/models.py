from sqlalchemy.sql._elements_constructors import desc
from app.api.database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, TIMESTAMP, text


class Vecino(Base):
    __tablename__ = "vecinos"

    id = Column(Integer, primary_key=True, index=True)
    nombres = Column(String, index=True)
    apellido_paterno = Column(String, index=True)
    apellido_materno = Column(String, index=True)
    rut = Column(String, unique=True, index=True)
    numero_socio = Column(Integer, unique=True, index=True)
    direccion = Column(String)
    fecha_registro = Column(
        TIMESTAMP(timezone=True), default=text("now()"), onupdate=text("now()")
    )
    fecha_edicion = Column(
        TIMESTAMP(timezone=True), default=text("now()"), onupdate=text("now()")
    )
    estado = Column(Integer, default=1)  # 1: activo, 0: inactivo


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    vecino_id = Column(Integer, ForeignKey("vecinos.id"))
    tipo_documento = Column(String)
    nombre_archivo = Column(String)
    ruta_archivo = Column(String)
    fecha_subida = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    vecino_id = Column(Integer, ForeignKey("vecinos.id"))


class Historial(Base):
    __tablename__ = "historial"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    descripcion = Column(String)
    tipo_accion = Column(String)
    fecha_accion = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
