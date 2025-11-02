# Desc

Esta es una app para vecinos. En realidad es mi proyecto de titulo

## Inicializacion

Esta seccion explica como se creo el proyecto en un inicio, para entender como _levantar_ el proyecto revisar el capitulo de ejecucion

### Backend

Para inicializar el backend primero creo un directorio en la raiz del repo con:

```bash
mkdir backend
```

Luego inicio el proyecto de python con:

```bash
uv init
```

E instalo las dependencias iniciales:

```bash
uv add 'fastapi[standard]'
```

### Frontend

Para inicializar el frontend utilizo la herramienta de npm para crear una template:

```bash
npm create vite@latest frontend
```

## Ejecucion

Los tres procesos que hay que corre son:

```bash
cd backend && uv run uvicorn app.api.main:app --reload --host 0.0.0.0 # Ejecuta el backend
cd frontend && npm run dev -- --host # Ejecuta el frontend
cd database && docker compose up -d # Levanta la base de datos
```
