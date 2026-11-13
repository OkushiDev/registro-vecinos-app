"""Tests de API con dependencias mockeadas (no requiere PostgreSQL)."""

from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from app.api.main import app
from app.api.dependencies import get_db, get_current_user


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def presidente_user():
    return {"user_id": 1, "rol": "presidente", "vecino_id": 5}


@pytest.fixture
def client(mock_db, presidente_user):
    def override_get_db():
        yield mock_db

    def override_get_current_user():
        return presidente_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestRoot:
    def test_root_endpoint(self):
        response = TestClient(app).get("/")
        assert response.status_code == 200
        assert "message" in response.json()


class TestVecinos:
    def test_lista_vecinos(self, client, mock_db):
        mock_query = MagicMock()
        mock_query.all.return_value = []
        mock_db.query.return_value = mock_query
        response = client.get("/lista-vecinos/")
        assert response.status_code == 200
        assert "vecinos" in response.json()

    def test_vecino_not_found(self, client, mock_db):
        mock_q = MagicMock()
        mock_q.first.return_value = None
        mock_db.query.return_value.filter.return_value = mock_q
        response = client.get("/vecino/999")
        assert response.status_code == 404

    def test_siguiente_numero(self, client, mock_db):
        mock_q = MagicMock()
        mock_r = MagicMock()
        mock_r.__getitem__.return_value = 50
        mock_q.first.return_value = mock_r
        mock_db.query.return_value = mock_q.order_by.return_value
        response = client.get("/siguiente-numero-socio/")
        assert response.status_code == 200


class TestDocumentos:
    def test_tipos_endpoint(self, client):
        response = client.get("/api/documentos/tipos")
        assert response.status_code == 200
        assert "tipos" in response.json()

    def test_mis_documentos(self, client, mock_db):
        mock_q = MagicMock()
        mock_q.all.return_value = []
        mock_db.query.return_value = mock_q.filter.return_value.order_by.return_value
        response = client.get("/api/documentos/mis-documentos")
        assert response.status_code == 200


class TestSolicitudes:
    def test_listar(self, client, mock_db):
        mock_q = MagicMock()
        mock_q.all.return_value = []
        mock_db.query.return_value = mock_q.order_by.return_value
        response = client.get("/api/solicitudes")
        assert response.status_code == 200

    def test_notificaciones(self, client, mock_db):
        mock_q = MagicMock()
        mock_q.all.return_value = []
        mock_db.query.return_value = mock_q.filter.return_value.order_by.return_value
        response = client.get("/api/solicitudes/notificaciones")
        assert response.status_code == 200
        assert response.json()["success"] is True


class TestHistorial:
    def test_listar(self, client, mock_db):
        mock_q = MagicMock()
        mock_q.all.return_value = []
        mock_db.query.return_value = mock_q.join.return_value
        response = client.get("/historial/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


@pytest.fixture
def vecino_client(mock_db):
    def override_get_db():
        yield mock_db

    def override_get_current_user():
        return {"user_id": 2, "rol": "vecino", "vecino_id": 2}

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestAutorizacion:
    def test_vecino_no_puede_listar_vecinos(self, vecino_client):
        assert vecino_client.get("/lista-vecinos/").status_code == 403

    def test_vecino_no_puede_ver_historial(self, vecino_client):
        assert vecino_client.get("/historial/").status_code == 403

    def test_vecino_no_puede_cambiar_estado(self, vecino_client):
        assert vecino_client.patch("/cambiar-estado-vecino/1").status_code == 403

    def test_vecino_no_puede_ver_datos_de_otro_vecino(self, vecino_client):
        assert vecino_client.get("/vecino/1").status_code == 403


def test_presidente_puede_cambiar_estado(client, mock_db):
    vecino = MagicMock()
    vecino.id = 1
    vecino.nombres = "Ana"
    vecino.apellido_paterno = "Perez"
    vecino.estado = 1
    mock_db.query.return_value.filter.return_value.first.return_value = vecino

    response = client.patch("/cambiar-estado-vecino/1")

    assert response.status_code == 200
    assert response.json()["nuevo_estado"] == 0


class TestLogin:
    def test_credenciales_invalidas_devuelve_401(self, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        app.dependency_overrides[get_db] = lambda: mock_db
        try:
            response = TestClient(app).post(
                "/api/token", data={"username": "12345678-9", "password": "mala"}
            )
            assert response.status_code == 401
        finally:
            app.dependency_overrides.clear()
