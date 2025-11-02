from fastapi import FastAPI

app = FastAPI()
@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/lista-vecinos")
async def lista_vecinos():
    vecinos = [
        {"nombre": "Juan", "edad": 30, "direccion": "Calle Falsa 123"},
        {"nombre": "Ana", "edad": 25, "direccion": "Avenida Siempre Viva 742"},
        {"nombre": "Luis", "edad": 40, "direccion": "Boulevard Central 456"},
    ]
    return {"vecinos": vecinos}
