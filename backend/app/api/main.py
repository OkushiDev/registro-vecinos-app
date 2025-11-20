from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import app.api.models as models
from app.api.database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware


# Modelo Pydantic basado en tu modelo SQLAlchemy existente
class VecinoCreate(BaseModel):
    nombres: str
    apellido_paterno: str
    apellido_materno: str
    rut: str
    numero_socio: int
    direccion: str

    class Config:
        from_attributes = True  # Para compatibilidad con SQLAlchemy


# Agregar modelo para actualización
class VecinoUpdate(BaseModel):
    nombres: str
    apellido_paterno: str
    apellido_materno: str
    rut: str
    numero_socio: int
    direccion: str

    class Config:
        from_attributes = True


app = FastAPI()
##Poblar la base de datos
models.Base.metadata.create_all(bind=engine)

## Definir el tipo de dato para la dependencia de la base de datos
db_dependency = Annotated[Session, Depends(get_db)]

# Configurar CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
# Agregar el middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/lista-vecinos/")
async def lista_vecinos(db: Session = Depends(get_db)):
    try:
        vecinos = db.query(models.Vecino).all()
        print(f"Vecinos encontrados: {len(vecinos)}")  # Debug
        return {"vecinos": vecinos}
    except Exception as e:
        print(f"Error en lista_vecinos: {e}")  # Debug
        raise HTTPException(status_code=500, detail=str(e))


# Otener un vecino específico
@app.get("/vecino/{vecino_id}")
async def obtener_vecino(vecino_id: int, db: Session = Depends(get_db)):
    try:
        vecino = db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()
        if not vecino:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        print(f"Vecino encontrado: {vecino.nombres}")  # Debug
        return {
            "id": vecino.id,
            "nombres": vecino.nombres,
            "apellido_paterno": vecino.apellido_paterno,
            "apellido_materno": vecino.apellido_materno,
            "rut": vecino.rut,
            "numero_socio": vecino.numero_socio,
            "direccion": vecino.direccion,
            "fecha_registro": str(vecino.fecha_registro),
            "fecha_edicion": str(vecino.fecha_edicion),
            "estado": vecino.estado,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en obtener_vecino: {e}")  # Debug
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agregar-vecino/")
async def agregar_vecino(vecino: VecinoCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si el RUT ya existe
        existing_vecino = (
            db.query(models.Vecino).filter(models.Vecino.rut == vecino.rut).first()
        )
        if existing_vecino:
            raise HTTPException(status_code=400, detail="El RUT ya está registrado")

        # Verificar si el número de socio ya existe
        existing_numero = (
            db.query(models.Vecino)
            .filter(models.Vecino.numero_socio == vecino.numero_socio)
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400, detail="El número de socio ya está registrado"
            )

        nuevo_vecino = models.Vecino(
            nombres=vecino.nombres,
            apellido_paterno=vecino.apellido_paterno,
            apellido_materno=vecino.apellido_materno,
            rut=vecino.rut,
            numero_socio=vecino.numero_socio,
            direccion=vecino.direccion,
        )
        db.add(nuevo_vecino)
        db.commit()
        db.refresh(nuevo_vecino)

        print(f"Vecino creado exitosamente: {nuevo_vecino.nombres}")  # Debug
        return {
            "message": "Vecino registrado exitosamente",
            "vecino": {
                "id": nuevo_vecino.id,
                "nombres": nuevo_vecino.nombres,
                "apellido_paterno": nuevo_vecino.apellido_paterno,
                "apellido_materno": nuevo_vecino.apellido_materno,
                "rut": nuevo_vecino.rut,
                "numero_socio": nuevo_vecino.numero_socio,
                "direccion": nuevo_vecino.direccion,
                "fecha_registro": str(nuevo_vecino.fecha_registro),
                "fecha_edicion": str(nuevo_vecino.fecha_edicion),
                "estado": nuevo_vecino.estado,
            },
        }
    except HTTPException:
        # Re-raise HTTPException para que FastAPI las maneje correctamente
        raise
    except Exception as e:
        print(f"Error en agregar_vecino: {e}")  # Debug
        db.rollback()  # Hacer rollback en caso de error
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


# Atualizar un vecino
@app.put("/editar-vecino/{vecino_id}")
async def editar_vecino(
    vecino_id: int, vecino_actualizado: VecinoUpdate, db: Session = Depends(get_db)
):
    try:
        # Buscar el vecino existente
        vecino_existente = (
            db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()
        )
        if not vecino_existente:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        print(f"Actualizando vecino: {vecino_existente.nombres}")  # Debug
        print(f"Fecha registro original: {vecino_existente.fecha_registro}")  # Debug
        print(f"Fecha edición anterior: {vecino_existente.fecha_edicion}")  # Debug

        # Verificar si el RUT ya existe en otro registro (excluir el actual)
        existing_rut = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.rut == vecino_actualizado.rut,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_rut:
            raise HTTPException(
                status_code=400, detail="El RUT ya está registrado en otro vecino"
            )

        # Verificar si el número de socio ya existe en otro registro (excluir el actual)
        existing_numero = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.numero_socio == vecino_actualizado.numero_socio,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400,
                detail="El número de socio ya está registrado en otro vecino",
            )

        # Guardar la fecha de registro original (para verificar que no cambie)
        fecha_registro_original = vecino_existente.fecha_registro

        # Actualizar SOLO los campos editables (NO la fecha_registro)
        vecino_existente.nombres = vecino_actualizado.nombres
        vecino_existente.apellido_paterno = vecino_actualizado.apellido_paterno
        vecino_existente.apellido_materno = vecino_actualizado.apellido_materno
        vecino_existente.rut = vecino_actualizado.rut
        vecino_existente.numero_socio = vecino_actualizado.numero_socio
        vecino_existente.direccion = vecino_actualizado.direccion

        # IMPORTANTE: NO modificamos fecha_registro
        # La fecha_edicion se actualizará automáticamente por el onupdate=text("now()") en el modelo

        db.commit()
        db.refresh(vecino_existente)

        # Verificar que las fechas están como esperamos
        print(
            f"Fecha registro después del update: {vecino_existente.fecha_registro}"
        )  # Debe ser igual a la original
        print(
            f"Fecha edición después del update: {vecino_existente.fecha_edicion}"
        )  # Debe ser actual

        # Verificar que fecha_registro no cambió
        if str(vecino_existente.fecha_registro) != str(fecha_registro_original):
            print("⚠️ ADVERTENCIA: La fecha de registro cambió inesperadamente")
        else:
            print("✅ La fecha de registro se conservó correctamente")

        return {
            "message": "Vecino actualizado exitosamente",
            "vecino": {
                "id": vecino_existente.id,
                "nombres": vecino_existente.nombres,
                "apellido_paterno": vecino_existente.apellido_paterno,
                "apellido_materno": vecino_existente.apellido_materno,
                "rut": vecino_existente.rut,
                "numero_socio": vecino_existente.numero_socio,
                "direccion": vecino_existente.direccion,
                "fecha_registro": str(
                    vecino_existente.fecha_registro
                ),  # Original conservada
                "fecha_edicion": str(
                    vecino_existente.fecha_edicion
                ),  # Actualizada automáticamente
                "estado": vecino_existente.estado,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en editar_vecino: {e}")  # Debug
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )
