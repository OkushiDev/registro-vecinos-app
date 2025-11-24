from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt

SECRET_KEY = "tu-clave-secreta-super-segura-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña en texto plano coincida con el hash"""
    try:
        if not hashed_password or not plain_password:
            print("Password o hash vacio")
            return False

        # Convertir a bytes
        password_bytes = plain_password.encode('utf-8')
        
        # Truncar a 72 bytes si es necesario
        if len(password_bytes) > 72:
            print(f"Password demasiado largo ({len(password_bytes)} bytes), truncando a 72")

            password_bytes = password_bytes[:72]

        # Convertir hash a bytes
        hash_bytes = hashed_password.encode('utf-8')
        
        # Convertir $2a$ a $2b$ para compatibilidad con PostgreSQL
        if hash_bytes.startswith(b"$2a$"):
            hash_bytes = b"$2b$" + hash_bytes[4:]

        # Verificar con bcrypt directamente
        result = bcrypt.checkpw(password_bytes, hash_bytes)
        print(f"Resultado de verificacion: {result}")
        return result
        
    except ValueError as e:
        print(f"Error de validacion: {e}")
        return False
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

        # Convertir a bytes
        password_bytes = password.encode('utf-8')
        
        # Truncar a 72 bytes si es necesario
        if len(password_bytes) > 72:
            print(f"Password demasiado largo ({len(password_bytes)} bytes), truncando a 72")
            password_bytes = password_bytes[:72]

        # Generar salt y hash con bcrypt directamente
        salt = bcrypt.gensalt(rounds=10)
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # Retornar como string
        return hashed.decode('utf-8')
        
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
