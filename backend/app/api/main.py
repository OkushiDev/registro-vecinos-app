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
