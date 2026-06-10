from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

import app.api.models as models
from app.api.database import engine

from app.api.routers import auth, vecinos, documentos, solicitudes, historial
from app.api import certificados

# Crear directorio de uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()


@app.on_event("startup")
def on_startup():
    """Crea las tablas en la BD al iniciar (si hay conexion)."""
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"⚠ No se pudieron crear las tablas (BD caida?): {e}")

# Servir archivos subidos como estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
