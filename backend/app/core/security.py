import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, ExpiredSignatureError, jwt
import bcrypt

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "DEV_ONLY_CHANGE_IN_PRODUCTION",  # default solo para desarrollo local
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña en texto plano coincida con el hash"""
    try:
        if not hashed_password or not plain_password:
            return False

        password_bytes = plain_password.encode("utf-8")
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]

        hash_bytes = hashed_password.encode("utf-8")
        if hash_bytes.startswith(b"$2a$"):
            hash_bytes = b"$2b$" + hash_bytes[4:]

        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Genera un hash bcrypt de la contraseña"""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]

    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """Crea un token JWT"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decodifica y valida un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            return None

        if isinstance(sub, str):
            try:
                user_id = int(sub)
            except ValueError:
                return None
        else:
            user_id = sub

        return {
            "sub": user_id,
            "rol": payload.get("rol"),
            "vecino_id": payload.get("vecino_id"),
        }
    except ExpiredSignatureError:
        print("Token expirado")
        return None
    except JWTError as e:
        print(f"Error al decodificar token: {e}")
        return None
