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
