from app.api.database import Base
from sqlalchemy import Column, ForeignKey, Integer, String, TIMESTAMP, text
from sqlalchemy.orm import relationship


class Vecino(Base):
    __tablename__ = "vecinos"

    id = Column(Integer, primary_key=True, index=True)
    nombres = Column(String, index=True)
    apellido_paterno = Column(String, index=True)
    apellido_materno = Column(String, index=True)
    rut = Column(String, unique=True, index=True)
    numero_socio = Column(Integer, unique=True, index=True)
    nombre_calle = Column(String, nullable=True, index=True)
    numero_casa = Column(String, nullable=True)
    relacion_propiedad = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    fecha_registro = Column(TIMESTAMP(timezone=True), default=text("now()"))
    fecha_edicion = Column(
        TIMESTAMP(timezone=True), default=text("now()"), onupdate=text("now()")
    )
    estado = Column(Integer, default=1)  # 1: activo, 0: inactivo

    # Relaciones
    usuario = relationship("Usuario", back_populates="vecino", uselist=False)
    documentos = relationship("Documento", back_populates="vecino")
    solicitudes = relationship("Solicitud", back_populates="vecino")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    vecino_id = Column(Integer, ForeignKey("vecinos.id"), unique=True)
    rol = Column(String, default="vecino")   # "vecino" | "presidente"
    estado = Column(Integer, default=1)      # 1: activo, 0: inactivo
    fecha_creacion = Column(TIMESTAMP(timezone=True), default=text("now()"))

    # Relación con Vecino
    vecino = relationship("Vecino", back_populates="usuario")


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    vecino_id = Column(Integer, ForeignKey("vecinos.id"), nullable=False)
    tipo_documento = Column(String, nullable=True)
    nombre_archivo = Column(String, nullable=False)
    ruta_archivo = Column(String, nullable=False)
    tipo_archivo = Column(String, nullable=True)
    tamanio = Column(Integer, nullable=True)
    descripcion = Column(String, nullable=True)
    fecha_subida = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    estado = Column(Integer, default=1)

    # Relación con Vecino
    vecino = relationship("Vecino", back_populates="documentos")


class Historial(Base):
    __tablename__ = "historial"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    descripcion = Column(String)
    tipo_accion = Column(String)
    fecha_accion = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id = Column(Integer, primary_key=True, index=True)
    vecino_id = Column(Integer, ForeignKey("vecinos.id"), nullable=False)
    tipo_solicitud = Column(
        String(100), default="certificado_residencia", nullable=False
    )
    fecha_solicitud = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    estado = Column(String(50), default="pendiente")   # "pendiente" | "realizado" | "rechazado"
    visibilidad = Column(String(50), default="mostrar") # "mostrar" | "oculto"

    # Relación
    vecino = relationship("Vecino", back_populates="solicitudes")
