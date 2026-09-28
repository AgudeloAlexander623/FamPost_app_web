# Photos APP

Proyecto de clase con 4 partes, cada una con su propia tecnologia:

| Carparta       | Tecnologia                        | Puerto | Que hace                                    |
| -------------- | --------------------------------- | ------ | ------------------------------------------- |
| `FrontEnd/`    | React 19 + TypeScript + Vite      | 5173   | Interfaz web para el usuario                |
| `BackEnd/`     | Node.js 24 + TypeScript + Express | 4000   | API principal (orquesta y expone datos)    |
| `Security/`    | Java 21 + Spring Boot + Security  | 8080   | Autenticacion y autorizacion (JWT)          |
| `MicroServicios/` | Python 3 + FastAPI             | 8000   | Microservicio de fotos                      |

## Arquitectura

```
   Navegador
      |  HTTP (Vite dev server, puerto 5173)
      v
  FrontEnd (React + TypeScript)
      |  /api  (proxy de Vite -> evita CORS en desarrollo)
      v
  BackEnd (Node + Express, puerto 4000)  ----->  PostgreSQL 18 (puerto 5432)
      |  |                                        base "photos_app"
      |  |
      |  +-------->  MicroServicios (Python/FastAPI, 8000)
      |
      |  POST /api/auth/login
      v
  Security (Java / Spring Boot, 8080)  ->  JWT (firmado con HS256)
      |
      v
  BackEnd valida el JWT y responde al FrontEnd
```

Flujo de autenticacion:

1. El usuario envia usuario y contrasena desde `FrontEnd` a `POST /api/auth/login`.
2. `BackEnd` reenvia las credenciales a `Security` (`POST /api/auth/login`).
3. `Security` valida contra los usuarios de `application.yml` y devuelve un JWT.
4. `BackEnd` devuelve el token al `FrontEnd`, que lo guarda en `localStorage`.
5. Las siguientes peticiones llevan `Authorization: Bearer <token>`.

## Requisitos instalados en WSL

Todo se instalo en el home del usuario (no hizo falta `sudo`):

| Herramienta | Version  | Ubicacion                                     |
| ----------- | -------- | --------------------------------------------- |
| Node.js     | 24.21.0  | `~/.nvm/versions/node/v24.21.0`               |
| npm         | 11.19.0  | (incluido con Node)                           |
| Java (JDK)  | 21.0.12  | `~/opt/jdk-21.0.12.1+1`                       |
| Maven       | 3.9.16   | `~/opt/apache-maven-3.9.16`                   |
| PostgreSQL  | 18.6     | `~/opt/pgsql18` (datos en `~/pgdata`)          |
| Python      | 3.14.4   | `/usr/bin/python3`                            |

El `PATH` quedo configurado en `~/.bashrc`. **Abre una terminal nueva de WSL** para
que reconozcan los comandos (`node`, `java`, `mvn`, `psql`, `python3`).

## Base de datos (PostgreSQL)

PostgreSQL 18.6 esta instalado en `~/opt/pgsql18` con los datos en `~/pgdata`
(instalado sin `sudo`, extrayendo los paquetes de Ubuntu). La base de datos del
proyecto es `photos_app` y el usuario es `postgres` con password `postgres`.

Comandos utiles (ya definidos como funciones en `~/.bashrc`):

```bash
pg_start        # arranca el servidor en localhost:5432
pg_status       # ver si esta corriendo
pg_stop         # detenerlo
psql -d photos_app        # abrir la consola de la base de datos
```

Tambien sirve `psql` con Docker: `docker exec -it <contenedor> psql -U postgres -d photos_app`.

Cuando este listo Docker, la opcion habitual es levantar PostgreSQL en un
contenedor y poner `DB_HOST=localhost` (o el nombre del servicio si comparten red).


## Como ejecutar todo

Abre 4 terminales de WSL (o usa las tareas de VS Code) y, en cada una, entra a la
carpeta del servicio y ejecuta el comando de desarrollo.

### 1. FrontEnd (React + TypeScript)

```bash
cd ~/escritorio/clases/Desarrollo2/photos_APP/FrontEnd
npm install
npm run dev        # http://localhost:5173
```

### 2. BackEnd (Node.js + Express)

```bash
cd ~/escritorio/clases/Desarrollo2/photos_APP/BackEnd
npm install
cp .env.example .env
npm run db:create      # solo la primera vez
npm run db:migrate     # solo la primera vez
npm run db:seed        # opcional: 2 fotos de ejemplo
npm run dev            # http://localhost:4000
```

Comprobar: `curl http://localhost:4000/api/health` (debe decir `"database":"connected"`)

### 3. Security (Java + Spring Boot)

```bash
cd ~/escritorio/clases/Desarrollo2/photos_APP/Security
./mvnw spring-boot:run     # o: mvn spring-boot:run
```

Comprobar:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

Usuarios de ejemplo: `admin / admin123` (ADMIN, USER) y `usuario / usuario123` (USER).

### 4. MicroServicios (Python + FastAPI)

```bash
cd ~/escritorio/clases/Desarrollo2/photos_APP/MicroServicios
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Documentacion interactiva: <http://localhost:8000/docs>
Comprobar: `curl http://localhost:8000/api/v1/health`

## Comandos utiles de cada parte

| Parte           | developing                        | build / produccion            | tests                |
| --------------- | --------------------------------- | ----------------------------- | -------------------- |
| `FrontEnd`      | `npm run dev`                     | `npm run build`               | -                    |
| `BackEnd`       | `npm run dev`                     | `npm run build && npm start`  | -                    |
| `Security`      | `mvn spring-boot:run`             | `mvn package`                 | `mvn test`           |
| `MicroServicios`| `uvicorn app.main:app --reload`   | -                             | `pytest`             |

Ademas: `npm run lint` y `npm run format` (FrontEnd y BackEnd), `ruff check .` y
`ruff format .` (MicroServicios), y `npm run db:create|db:migrate|db:revert|db:seed`
(BackEnd).

## Variables de entorno

Ningun `.env` esta en el repositorio. Cada parte tiene su `.env.example`:

- `FrontEnd/.env.example` -> `VITE_API_URL`, `VITE_BACKEND_URL`
- `BackEnd/.env.example` -> `PORT`, `CORS_ORIGIN`, urls de los otros servicios,
  y las de PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
  `DB_SSL`, `DB_LOGGING`)
- `MicroServicios/.env.example` -> `HOST`, `PORT`, urls de los otros servicios
- `Security/src/main/resources/application.yml` -> puerto, JWT, usuarios de ejemplo
  (el secreto se puede sobreescribir con la variable de entorno `JWT_SECRET`)

## Notas de la instalacion

- Node se instalo con **nvm** en WSL. Los scripts de instalacion de npm 11 vienen
  bloqueados por defecto: si Vite o tsx fallan con un error de binario, ejecuta
  `npm rebuild esbuild --foreground-scripts`.
- Python 3.14 de Ubuntu no trae `ensurepip`, por eso el venv se creo con
  `python3 -m venv --without-pip .venv` y despues se instalo `pip` dentro con
  `get-pip.py`. Si recreas el venv, repite esos dos pasos.
- Maven se uso de forma local (`~/opt`), pero el proyecto incluye `mvnw`, asi que
  `./mvnw` funciona sin tener Maven instalado en el sistema.
- PostgreSQL tambien se instalo en `~/opt` (sin `sudo`): se descargaron los `.deb`
  de Ubuntu y se extrajeron. Por eso `psql` necesita `LD_LIBRARY_PATH`; los
  helpers `psql` y `pg_ctl` de `~/.bashrc` ya lo gestionan. El socket esta en
  `~/.pgsock` en vez de `/var/run/postgresql`.
