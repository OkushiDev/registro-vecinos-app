"""Variables de entorno de prueba: los tests no deben depender de .env ni de una BD real."""

import os

os.environ.setdefault(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"
)
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
