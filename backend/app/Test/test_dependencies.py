"""Tests de la dependencia de autorización por rol."""

import pytest
from fastapi import HTTPException

from app.api.dependencies import require_presidente


def test_require_presidente_permite_presidente():
    user = {"user_id": 1, "rol": "presidente", "vecino_id": 35}
    assert require_presidente(user) is user


def test_require_presidente_rechaza_vecino():
    with pytest.raises(HTTPException) as exc:
        require_presidente({"user_id": 2, "rol": "vecino", "vecino_id": 2})
    assert exc.value.status_code == 403
