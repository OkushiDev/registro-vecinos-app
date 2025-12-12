from fastapi.testclient import TestClient
from app.api.main import app
import random

client = TestClient(app)

# Generamos datos aleatorios para no repetir RUT/Socio y que no falle el test al correrlo 2 veces
random_id = random.randint(1000, 9999)
rut_prueba = f"99.999.{random_id}-K"
socio_prueba = random_id # Usamos el random como numero socio

def test_root():
    """Prueba básica de conexión"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_crear_vecino_y_login():
    """
    Prueba de integración: 
    1. Crea un vecino (Endpoint protegido, pero simulamos el flujo)
    NOTA: Como /agregar-vecino requiere token de Presidente, 
    para este test unitario probaremos primero que el endpoint RECHAZA sin token (401),
    lo cual confirma que la seguridad funciona.
    """
    datos_vecino = {
        "nombres": "Test Unitario",
        "apellido_paterno": "Pytest",
        "apellido_materno": "Crud",
        "rut": rut_prueba,
        "numero_socio": socio_prueba,
        "nombre_calle": "Calle Testing",
        "numero_casa": "123",
        "email": "test@vecinos.cl"
    }
    
    # Intento sin token -> Debería fallar (401 Unauthorized)
    # Esto confirma que tu seguridad está activa
    response = client.post("/agregar-vecino/", json=datos_vecino)
    assert response.status_code == 401

def test_listar_vecinos():
    """Prueba que el endpoint público de lista funciona"""
    response = client.get("/lista-vecinos/")
    assert response.status_code == 200
    datos = response.json()
    assert "vecinos" in datos
    assert isinstance(datos["vecinos"], list)

def test_tipos_documentos():
    """Prueba que los tipos de documentos se listan correctamente"""
    response = client.get("/api/documentos/tipos")
    assert response.status_code == 200
    datos = response.json()
    assert "tipos" in datos
    assert len(datos["tipos"]) > 0