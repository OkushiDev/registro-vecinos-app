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
    fecha_registro = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    fecha_edicion = Column(
        TIMESTAMP(timezone=True), default=text("now()"), onupdate=text("now()")
    )
