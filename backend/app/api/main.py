from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import app.api.models as models
from app.api.database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware


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
async def agregar_vecino(
    nombres: str,
    apellido_paterno: str,
    apellido_materno: str,
    rut: str,
    numero_socio: int,
    direccion: str,
    db: Session = Depends(get_db),
):
    try:
        nuevo_vecino = models.Vecino(
            nombres=nombres,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            rut=rut,
            numero_socio=numero_socio,
            direccion=direccion,
        )
        db.add(nuevo_vecino)
        db.commit()
        db.refresh(nuevo_vecino)
        return {"vecino": nuevo_vecino}
    except Exception as e:
        print(f"Error en agregar_vecino: {e}")  # Debug
        raise HTTPException(status_code=500, detail=str(e))
