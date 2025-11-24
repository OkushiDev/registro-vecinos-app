from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Annotated, Optional
from datetime import timedelta
import app.api.models as models
from app.api.database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware


# Importar funciones de seguridad
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    decode_token,
)

# Configurar OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")


class VecinoCreate(BaseModel):
    nombres: str
    apellido_paterno: str
    apellido_materno: str
    rut: str
    numero_socio: int
    nombre_calle: Optional[str] = None
    numero_casa: Optional[str] = None
    relacion_propiedad: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


class VecinoUpdate(BaseModel):
    nombres: str
    apellido_paterno: str
    apellido_materno: str
    rut: str
    numero_socio: int
    nombre_calle: Optional[str] = None
    numero_casa: Optional[str] = None
    relacion_propiedad: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


# Modelos para autenticación
class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str
    user_id: int
    vecino_id: int
    nombre_completo: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    rol: Optional[str] = None


class UserLogin(BaseModel):
    usuario: str
    password: str


app = FastAPI()
models.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]

# Configurar CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Función auxiliar para generar contraseña
def generar_password_inicial(rut: str, apellido_paterno: str) -> str:
    """
    Genera contraseña inicial: apellido_paterno + primeros 4 dígitos del RUT
    Ejemplo: RUT 14306046-2, Apellido Benavides -> Benavides1430
    """
    # Limpiar el RUT (quitar puntos y guión)
    rut_limpio = rut.replace(".", "").replace("-", "")
    # Tomar los primeros 4 dígitos
    primeros_4_digitos = rut_limpio[:4]
    return f"{apellido_paterno}{primeros_4_digitos}"


def crear_usuario_para_vecino(db: Session, vecino: models.Vecino) -> models.Usuario:
    """
    Crea un usuario automáticamente para un vecino nuevo.
    Username: RUT con formato 12345678-9 (sin puntos, con guión)
    Password inicial: apellido_paterno + primeros 4 dígitos del RUT
    """
    # Username es el RUT en formato sin puntos pero con guión
    username = vecino.rut.replace(".", "")  # Solo quitar puntos, mantener guión

    # Generar password inicial
    password_inicial = generar_password_inicial(vecino.rut, vecino.apellido_paterno)
    hashed_password = get_password_hash(password_inicial)

    # Determinar rol: presidente solo para número de socio 35
    rol = "presidente" if vecino.numero_socio == 35 else "vecino"

    # Crear usuario
    nuevo_usuario = models.Usuario(
        username=username,
        hashed_password=hashed_password,
        vecino_id=vecino.id,
        rol=rol,
        estado=vecino.estado,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    print(f"Usuario creado automaticamente:")
    print(f"  Username: {username}")
    print(f"  Password inicial: {password_inicial}")
    print(f"  Rol: {rol}")

    return nuevo_usuario


# Función para obtener el usuario actual del token
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    rol: str = payload.get("rol")

    if user_id is None or rol is None:
        raise credentials_exception

    # Verificar que el usuario existe y está activo
    usuario = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not usuario or usuario.estado != 1:
        raise credentials_exception

    return {"user_id": user_id, "rol": rol, "vecino_id": usuario.vecino_id}


@app.get("/")
async def read_root():
    return {"Hello": "World"}


# ============ ENDPOINTS DE AUTENTICACIÓN ============


@app.post("/api/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Endpoint de autenticación.
    Retorna un token JWT si las credenciales son válidas.
    """
    try:
        print(f"\n--- Intento de login ---")
        print(f"Username recibido: {form_data.username}")

        # Buscar usuario por username (RUT sin puntos ni guión)
        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.username == form_data.username)
            .first()
        )

        if not usuario:
            print(f"Usuario no encontrado: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print(
            f"Usuario encontrado - ID: {usuario.id}, Rol: {usuario.rol}, Estado: {usuario.estado}"
        )
        print(f"Hash almacenado (primeros 30 chars): {usuario.hashed_password[:30]}...")

        # Verificar si el usuario está activo
        if usuario.estado != 1:
            print("Usuario deshabilitado")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario deshabilitado. Contacte al administrador.",
            )

        # Verificar contraseña
        print(f"Verificando contraseña...")
        password_valida = verify_password(form_data.password, usuario.hashed_password)
        print(f"Password valida: {password_valida}")

        if not password_valida:
            print("Contraseña incorrecta")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Obtener datos del vecino
        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == usuario.vecino_id)
            .first()
        )

        if not vecino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Datos del vecino no encontrados",
            )

        # Verificar que el vecino también esté activo
        if vecino.estado != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vecino deshabilitado. Contacte al administrador.",
            )

        # Crear token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": usuario.id, "rol": usuario.rol, "vecino_id": vecino.id},
            expires_delta=access_token_expires,
        )

        nombre_completo = (
            f"{vecino.nombres} {vecino.apellido_paterno} {vecino.apellido_materno}"
        )

        print(f"Login exitoso para: {nombre_completo}")
        print("--- Fin intento de login ---\n")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "rol": usuario.rol,
            "user_id": usuario.id,
            "vecino_id": vecino.id,
            "nombre_completo": nombre_completo,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en login: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la solicitud: {str(e)}",
        )


@app.get("/api/me")
async def get_me(
    current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Retorna los datos del usuario autenticado
    """
    try:
        vecino = (
            db.query(models.Vecino)
            .filter(models.Vecino.id == current_user["vecino_id"])
            .first()
        )

        if not vecino:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vecino no encontrado"
            )

        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.id == current_user["user_id"])
            .first()
        )

        return {
            "user_id": usuario.id,
            "username": usuario.username,
            "rol": usuario.rol,
            "vecino": {
                "id": vecino.id,
                "nombres": vecino.nombres,
                "apellido_paterno": vecino.apellido_paterno,
                "apellido_materno": vecino.apellido_materno,
                "rut": vecino.rut,
                "numero_socio": vecino.numero_socio,
                "nombre_calle": vecino.nombre_calle,
                "numero_casa": vecino.numero_casa,
                "relacion_propiedad": vecino.relacion_propiedad,
                "telefono": vecino.telefono,
                "email": vecino.email,
                "fecha_registro": str(vecino.fecha_registro),
                "estado": vecino.estado,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener datos del usuario",
        )


@app.post("/api/hash-password")
async def hash_password(password: str):
    """
    Endpoint temporal para generar hashes de contraseñas.
    ELIMINAR EN PRODUCCIÓN
    """
    return {"hashed_password": get_password_hash(password)}


# ============ ENDPOINTS DE CRUD ============


@app.get("/lista-vecinos/")
async def lista_vecinos(db: Session = Depends(get_db)):
    try:
        vecinos = db.query(models.Vecino).order_by(models.Vecino.id).all()
        print(f"Vecinos encontrados: {len(vecinos)}")
        return {"vecinos": vecinos}
    except Exception as e:
        print(f"Error en lista_vecinos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/vecino/{vecino_id}")
async def obtener_vecino(vecino_id: int, db: Session = Depends(get_db)):
    try:
        vecino = db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()
        if not vecino:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        print(f"Vecino encontrado: {vecino.nombres}")
        return {
            "id": vecino.id,
            "nombres": vecino.nombres,
            "apellido_paterno": vecino.apellido_paterno,
            "apellido_materno": vecino.apellido_materno,
            "rut": vecino.rut,
            "numero_socio": vecino.numero_socio,
            "nombre_calle": vecino.nombre_calle,
            "numero_casa": vecino.numero_casa,
            "relacion_propiedad": vecino.relacion_propiedad,
            "telefono": vecino.telefono,
            "email": vecino.email,
            "fecha_registro": str(vecino.fecha_registro),
            "fecha_edicion": str(vecino.fecha_edicion),
            "estado": vecino.estado,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en obtener_vecino: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agregar-vecino/")
async def agregar_vecino(vecino: VecinoCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si el RUT ya existe
        existing_vecino = (
            db.query(models.Vecino).filter(models.Vecino.rut == vecino.rut).first()
        )
        if existing_vecino:
            raise HTTPException(status_code=400, detail="El RUT ya está registrado")

        # Verificar si el número de socio ya existe
        existing_numero = (
            db.query(models.Vecino)
            .filter(models.Vecino.numero_socio == vecino.numero_socio)
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400, detail="El número de socio ya está registrado"
            )

        # Crear el vecino
        nuevo_vecino = models.Vecino(
            nombres=vecino.nombres,
            apellido_paterno=vecino.apellido_paterno,
            apellido_materno=vecino.apellido_materno,
            rut=vecino.rut,
            numero_socio=vecino.numero_socio,
            nombre_calle=vecino.nombre_calle,
            numero_casa=vecino.numero_casa,
            relacion_propiedad=vecino.relacion_propiedad,
            telefono=vecino.telefono,
            email=vecino.email,
        )
        db.add(nuevo_vecino)
        db.commit()
        db.refresh(nuevo_vecino)

        print(f"Vecino creado exitosamente: {nuevo_vecino.nombres}")

        # Crear usuario automáticamente
        nuevo_usuario = crear_usuario_para_vecino(db, nuevo_vecino)

        return {
            "message": "Vecino y usuario registrados exitosamente",
            "vecino": {
                "id": nuevo_vecino.id,
                "nombres": nuevo_vecino.nombres,
                "apellido_paterno": nuevo_vecino.apellido_paterno,
                "apellido_materno": nuevo_vecino.apellido_materno,
                "rut": nuevo_vecino.rut,
                "numero_socio": nuevo_vecino.numero_socio,
                "nombre_calle": nuevo_vecino.nombre_calle,
                "numero_casa": nuevo_vecino.numero_casa,
                "relacion_propiedad": nuevo_vecino.relacion_propiedad,
                "telefono": nuevo_vecino.telefono,
                "email": nuevo_vecino.email,
                "fecha_registro": str(nuevo_vecino.fecha_registro),
                "fecha_edicion": str(nuevo_vecino.fecha_edicion),
                "estado": nuevo_vecino.estado,
            },
            "usuario": {
                "username": nuevo_usuario.username,
                "rol": nuevo_usuario.rol,
                "password_inicial": generar_password_inicial(
                    nuevo_vecino.rut, nuevo_vecino.apellido_paterno
                ),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en agregar_vecino: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@app.put("/editar-vecino/{vecino_id}")
async def editar_vecino(
    vecino_id: int, vecino_actualizado: VecinoUpdate, db: Session = Depends(get_db)
):
    try:
        vecino_existente = (
            db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()
        )
        if not vecino_existente:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        # Verificar RUT duplicado
        existing_rut = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.rut == vecino_actualizado.rut,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_rut:
            raise HTTPException(
                status_code=400, detail="El RUT ya está registrado en otro vecino"
            )

        # Verificar número de socio duplicado
        existing_numero = (
            db.query(models.Vecino)
            .filter(
                models.Vecino.numero_socio == vecino_actualizado.numero_socio,
                models.Vecino.id != vecino_id,
            )
            .first()
        )
        if existing_numero:
            raise HTTPException(
                status_code=400,
                detail="El número de socio ya está registrado en otro vecino",
            )

        # Actualizar campos
        vecino_existente.nombres = vecino_actualizado.nombres
        vecino_existente.apellido_paterno = vecino_actualizado.apellido_paterno
        vecino_existente.apellido_materno = vecino_actualizado.apellido_materno
        vecino_existente.rut = vecino_actualizado.rut
        vecino_existente.numero_socio = vecino_actualizado.numero_socio
        vecino_existente.nombre_calle = vecino_actualizado.nombre_calle
        vecino_existente.numero_casa = vecino_actualizado.numero_casa
        vecino_existente.relacion_propiedad = vecino_actualizado.relacion_propiedad
        vecino_existente.telefono = vecino_actualizado.telefono
        vecino_existente.email = vecino_actualizado.email

        db.commit()
        db.refresh(vecino_existente)

        # Actualizar username del usuario si cambió el RUT
        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.vecino_id == vecino_id)
            .first()
        )
        if usuario:
            nuevo_username = vecino_actualizado.rut.replace(".", "").replace("-", "")
            if usuario.username != nuevo_username:
                usuario.username = nuevo_username
                db.commit()

        return {
            "message": "Vecino actualizado exitosamente",
            "vecino": {
                "id": vecino_existente.id,
                "nombres": vecino_existente.nombres,
                "apellido_paterno": vecino_existente.apellido_paterno,
                "apellido_materno": vecino_existente.apellido_materno,
                "rut": vecino_existente.rut,
                "numero_socio": vecino_existente.numero_socio,
                "nombre_calle": vecino_existente.nombre_calle,
                "numero_casa": vecino_existente.numero_casa,
                "relacion_propiedad": vecino_existente.relacion_propiedad,
                "telefono": vecino_existente.telefono,
                "email": vecino_existente.email,
                "fecha_registro": str(vecino_existente.fecha_registro),
                "fecha_edicion": str(vecino_existente.fecha_edicion),
                "estado": vecino_existente.estado,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en editar_vecino: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@app.patch("/cambiar-estado-vecino/{vecino_id}")
async def cambiar_estado_vecino(vecino_id: int, db: Session = Depends(get_db)):
    try:
        vecino_existente = (
            db.query(models.Vecino).filter(models.Vecino.id == vecino_id).first()
        )
        if not vecino_existente:
            raise HTTPException(status_code=404, detail="Vecino no encontrado")

        nuevo_estado = 0 if vecino_existente.estado == 1 else 1
        estado_texto = "habilitado" if nuevo_estado == 1 else "deshabilitado"

        vecino_existente.estado = nuevo_estado

        # También cambiar el estado del usuario asociado
        usuario = (
            db.query(models.Usuario)
            .filter(models.Usuario.vecino_id == vecino_id)
            .first()
        )
        if usuario:
            usuario.estado = nuevo_estado

        db.commit()
        db.refresh(vecino_existente)

        print(f"✅ Estado cambiado exitosamente a {estado_texto}")

        return {
            "message": f"Vecino {estado_texto} exitosamente",
            "vecino": {
                "id": vecino_existente.id,
                "nombres": vecino_existente.nombres,
                "apellido_paterno": vecino_existente.apellido_paterno,
                "apellido_materno": vecino_existente.apellido_materno,
                "rut": vecino_existente.rut,
                "numero_socio": vecino_existente.numero_socio,
                "nombre_calle": vecino_existente.nombre_calle,
                "numero_casa": vecino_existente.numero_casa,
                "relacion_propiedad": vecino_existente.relacion_propiedad,
                "telefono": vecino_existente.telefono,
                "email": vecino_existente.email,
                "fecha_registro": str(vecino_existente.fecha_registro),
                "fecha_edicion": str(vecino_existente.fecha_edicion),
                "estado": vecino_existente.estado,
            },
            "nuevo_estado": nuevo_estado,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en cambiar_estado_vecino: {e}")
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@app.get("/siguiente-numero-socio/")
async def siguiente_numero_socio(db: Session = Depends(get_db)):
    try:
        # Obtener el número de socio más alto
        max_numero = (
            db.query(models.Vecino.numero_socio)
            .order_by(models.Vecino.numero_socio.desc())
            .first()
        )

        if max_numero and max_numero[0]:
            siguiente_numero = max_numero[0] + 1
        else:
            siguiente_numero = 1  # Si no hay vecinos, empezar desde 1

        print(f"Siguiente número de socio disponible: {siguiente_numero}")  # Debug
        return {"siguiente_numero_socio": siguiente_numero}
    except Exception as e:
        print(f"Error en siguiente_numero_socio: {e}")  # Debug
        raise HTTPException(status_code=500, detail=str(e))
