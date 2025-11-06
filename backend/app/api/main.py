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


@app.get("/lista-vecinos")
async def lista_vecinos(db: db_dependency):
    vecinos = db.query(models.Vecino).all()
    return {"vecinos": vecinos}
