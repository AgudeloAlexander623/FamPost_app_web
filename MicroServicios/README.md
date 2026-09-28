# MicroServicios - Python + FastAPI

Microservicio de fotos. Por ahora los datos se guardan en memoria; la estructura
ya esta preparada para conectar SQLAlchemy.

## Puesta en marcha

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Documentacion interactiva: <http://localhost:8000/docs>

> Si `python3 -m venv` falla al crear el venv, Ubuntu 26.04 no trae `ensurepip`.
> Usa `python3 -m venv --without-pip .venv` y luego
> `curl -sSL https://bootstrap.pypa.io/get-pip.py | .venv/bin/python`.

## Comandos

| Comando                        | Que hace                          |
| ------------------------------ | --------------------------------- |
| `.venv/bin/pytest`             | Ejecuta las pruebas                |
| `.venv/bin/ruff check .`       | Linter (flake8 + isort + mas)      |
| `.venv/bin/ruff format .`     | Formateador                        |
| `.venv/bin/ruff check --fix .` | Correcciones automaticas           |

## Estructura

```
app/
  main.py            Aplicacion FastAPI, CORS y ciclo de vida
  core/config.py     Configuracion con pydantic-settings
  api/v1/router.py   Router de la API
  api/v1/endpoints/  health.py, photos.py
  schemas/           Modelos Pydantic de entrada y salida
  services/          Logica de negocio
  clients/           Cliente HTTP del servicio de seguridad (Java)
tests/               Pruebas con pytest
```

## Endpoints

| Metodo | Ruta                    | Descripcion                |
| ------ | ----------------------- | -------------------------- |
| GET    | `/`                     | Informacion del servicio   |
| GET    | `/api/v1/health`        | Estado del servicio        |
| GET    | `/api/v1/photos/`       | Lista las fotos            |
| GET    | `/api/v1/photos/{id}`   | Obtiene una foto           |
| POST   | `/api/v1/photos/`       | Crea una foto              |

Ejemplo:

```bash
curl -X POST http://localhost:8000/api/v1/photos/ \
  -H 'Content-Type: application/json' \
  -d '{"title":"Atardecer","url":"https://example.com/foto.jpg"}'
```

## Anadir otro microservicio

Crea una carpeta hermana con la misma estructura (`app/main.py`, `api/`, `schemas/`)
y su propio `.venv` y `requirements.txt`. Cada uno escucha en un puerto distinto.
