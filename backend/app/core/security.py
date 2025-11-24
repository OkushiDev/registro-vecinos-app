from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt

SECRET_KEY = "tu-clave-secreta-super-segura-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña en texto plano coincida con el hash"""
    try:
        if not hashed_password or not plain_password:
            print("Password o hash vacio")
            return False

        # Truncar password a 72 bytes si es necesario
        password_bytes = plain_password.encode("utf-8")
        if len(password_bytes) > 72:
            print(
                f"Password demasiado largo ({len(password_bytes)} bytes), truncando a 72"
            )
            password_bytes = password_bytes[:72]
            plain_password = password_bytes.decode("utf-8", errors="ignore")

        # Convertir $2a$ a $2b$ si es necesario (compatibilidad PostgreSQL)
        if hashed_password.startswith("$2a$"):
            hashed_password = "$2b$" + hashed_password[4:]

        if not hashed_password.startswith("$2b$") and not hashed_password.startswith(
            "$2a$"
        ):
            print(f"Hash invalido - no es bcrypt: {hashed_password[:20]}")
            return False

        result = pwd_context.verify(plain_password, hashed_password)
        print(f"Resultado de verificacion: {result}")
        return result
    except Exception as e:
        print(f"Error al verificar contraseña: {e}")
        import traceback

        traceback.print_exc()
        return False


def get_password_hash(password: str) -> str:
    """Genera un hash bcrypt de la contraseña"""
    try:
        if not password:
            raise ValueError("La contraseña no puede estar vacia")

        # Truncar password a 72 bytes si es necesario
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > 72:
            print(
                f"Password demasiado largo ({len(password_bytes)} bytes), truncando a 72"
            )
            password_bytes = password_bytes[:72]
            password = password_bytes.decode("utf-8", errors="ignore")

        return pwd_context.hash(password)
    except Exception as e:
        print(f"Error al hashear contraseña: {e}")
        raise


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str):
    """Decodifica y valida un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"Error al decodificar token: {e}")
        return None
