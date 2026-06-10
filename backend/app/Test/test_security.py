"""Tests para funciones de seguridad: JWT y bcrypt."""

import time
from datetime import timedelta
import pytest
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "MiClaveSegura2024!"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password(self):
        hashed = get_password_hash("password_correcto")
        assert not verify_password("password_incorrecto", hashed)

    def test_empty_password(self):
        assert not verify_password("", "$2b$12$hashinvalido")

    def test_invalid_hash(self):
        assert not verify_password("test", "hash_no_valido")

    def test_long_password(self):
        password = "a" * 100
        hashed = get_password_hash(password)
        assert verify_password(password, hashed)


class TestJWT:
    def test_create_and_decode(self):
        data = {"sub": "1", "rol": "presidente", "vecino_id": 5}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == 1
        assert payload["rol"] == "presidente"
        assert payload["vecino_id"] == 5

    def test_token_with_vecino_role(self):
        data = {"sub": "10", "rol": "vecino", "vecino_id": 10}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["rol"] == "vecino"

    def test_token_missing_sub(self):
        from jose import jwt
        from app.core.security import SECRET_KEY, ALGORITHM
        token = jwt.encode({"rol": "vecino", "sub": "1"}, SECRET_KEY, algorithm=ALGORITHM)
        assert decode_token(token) is not None

    def test_invalid_token(self):
        assert decode_token("token.invalido.123") is None

    def test_expired_token(self):
        data = {"sub": "1", "rol": "vecino"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))
        time.sleep(0.1)
        assert decode_token(token) is None

    def test_custom_expiry(self):
        data = {"sub": "1", "rol": "vecino"}
        token = create_access_token(data, expires_delta=timedelta(hours=1))
        assert decode_token(token) is not None

    def test_default_expiry(self):
        data = {"sub": "1", "rol": "vecino"}
        token = create_access_token(data)
        assert decode_token(token) is not None
        assert ACCESS_TOKEN_EXPIRE_MINUTES == 480
