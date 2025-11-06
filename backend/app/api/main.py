from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import app.api.models as models
from app.api.database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session


app = FastAPI()
models.Base.metadata.create_all(bind=engine)


@app.get("/")
async def read_root():
    return {"Hello": "World"}


db_dependency = Annotated[Session, Depends(get_db)]


@app.get("/lista-vecinos")
async def lista_vecinos(db: db_dependency):
    vecinos = db.query(models.Vecino).all()
    return {"vecinos": vecinos}
