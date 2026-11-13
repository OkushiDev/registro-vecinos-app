from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.api.models as models
from app.api.database import engine

from app.api.routers import auth, vecinos, documentos, solicitudes, historial
from app.api import certificados


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Intenta crear las tablas en la BD al iniciar. No interrumpe si la BD no esta disponible."""
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠ No se pudieron crear las tablas (BD caida?): {e}")
    yield


app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Routers
app.include_router(auth.router)
app.include_router(vecinos.router)
app.include_router(documentos.router)
app.include_router(solicitudes.router)
app.include_router(historial.router)
app.include_router(certificados.router, prefix="/api", tags=["certificados"])


@app.get("/")
async def read_root():
    return {"message": "Registro Vecinos API"}
