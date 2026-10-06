# AGENTS.md

Instrucciones para agentes que trabajan en Photos APP. El `README.md` ya documenta la
arquitectura, los puertos, el arranque y el despliegue: **léelo primero** y no lo repitas
aquí. Este fichero solo recoge lo que no se deduce leyendo el README.

## Estructura

Cuatro servicios independientes, **cada uno con su propio toolchain, `node_modules` o
`.venv`**. No hay `package.json` ni Makefile en la raíz: para cualquier comando hay que
entrar en el directorio de la parte (`BackEnd/`, `FrontEnd/`, `Security/`,
`MicroServicios/`). No esperes un orquestador que los levante todos.

| Parte | Toolchain | Puerto |
| ----- | --------- | ------ |
| `FrontEnd/` | React 19 + TS + Vite 8 | 5173 (`strictPort`, no cede al 5174) |
| `BackEnd/` | Node 24 + Express 4 + TypeORM | 4000 |
| `Security/` | Java 21 + Spring Boot | 8080 |
| `MicroServicios/` | Python + FastAPI | 8000 |

Entorno WSL. Node (nvm), JDK, Maven y PostgreSQL se instalaron en el home **sin
`sudo`**; si `node`, `java`, `mvn` o `psql` no aparecen, abre una terminal nueva para
que se cargue el `PATH` de `~/.bashrc`. PostgreSQL usa el socket en `~/.pgsock`, así que
arráncalo con `pg_start` (alias de `~/.bashrc`), nunca llamando a `pg_ctl` a mano.

## Trampas de `BackEnd` (el servicio central)

- **Una migración nueva no se ejecuta sola.** `src/config/database.ts` lista las
  migraciones de forma explícita: `migrations: [InitialSchema1759000000000]`. Al crear
  un `.ts` nuevo en `src/migrations/`, impórtalo y añádelo a ese array, o
  `npm run db:migrate` lo ignorará en silencio.
- `synchronize: false` y `migrationsRun: false` a propósito. **El esquema cambia solo
  con migraciones.** No los "fixes" para hacer que algo funcione en local.
- **El servidor arranca aunque PostgreSQL esté caído.** Falla la inicialización del
  `DataSource`, se loguea un aviso y sigue escuchando; las rutas que usen la base de
  datos fallarán después. `GET /api/health` responde `503` con
  `"database":"unavailable"`. No lo interpretes como un fallo de arranque.
- **Express 4 no captura rechazos de promesas.** Los controladores son objetos planos
  que lanzan (`throw new AppError(...)`) y **toda** ruta asíncrona se registra envuelta
  en `asyncHandler(...)`. Ver `routes/photo.routes.ts`. Olvidártelo hace que el error se
  pierda en silencio.
- Una ruta nueva no existe hasta registrarla en `src/routes/index.ts`.
- `tsconfig.json` es estricto con `noUncheckedIndexedAccess`: los indexados por clave
  devuelven `T | undefined`. Añade el guard, no un `!`.

## Cableado que parece existir y no está conectado

Esto genera código y `.env` que parecen integrarse pero son **configuración muerta**.
No asumas que tocar algo aquí rompe otro servicio.

- `PHOTOS_SERVICE_URL` se declara en `src/config/env.ts` y en `.env.example`, pero
  **ningún código lo lee**. `photo.service.ts` va directo a PostgreSQL con TypeORM.
  El `BackEnd` nunca llama a `MicroServicios`.
- Hay **dos almacenes de fotos distintos**: PostgreSQL en `BackEnd` y un diccionario en
  memoria en `MicroServicios` (`app/services/photo_service.py`). Cambiar uno no afecta
  al otro.
- `MicroServicios/app/clients/security_client.py` está definido y nadie lo importa.
- `BackEnd/src/controllers/like.controller.ts` está **vacío** y no está en las rutas.
- `entities/like.ts` y `entities/coments.ts` existen pero no están en el array
  `entities` del `DataSource`.

## Autenticación: el hueco conocido

`Security` emite y firma el JWT correctamente y `FrontEnd` lo envía, pero **el
`BackEnd` no valida nada**: no hay middleware que lea el token, así que
`GET /api/photos` responde igual con o sin `Authorization`. `JWT_SECRET` y
`JWT_EXPIRES_IN` están en `env.ts` y hoy no se usan. Los roles viajan en el token pero no
autorizan nada. No escribas código que dé por hecho que un endpoint está protegido.

Del lado del navegador el token vive en `localStorage` bajo la clave **`access_token`**
y `src/services/api.ts` lo añade con un interceptor de axios (timeout 10 s). En
desarrollo el proxy de Vite manda `/api` a `http://localhost:4000`, por eso no hay
problemas de CORS; `VITE_BACKEND_URL` solo afecta al target del proxy.

## Comandos que se adivinan mal

```bash
# FrontEnd NO tiene script "lint": usa npx directamente
npx eslint . ; npx prettier .          # el "npm run lint" falla
npm run typecheck

# BackEnd
npm run typecheck && npm run lint && npm run format:check   # orden recomendado
npm run db:create && npm run db:migrate                     # primera vez, en ese orden
```

- `Security` usa `spring-boot-starter-webmvc`, **no** `spring-boot-starter-web`, y una
  base H2 en memoria con `ddl-auto: update` (contraseñas en `application.yml`, no en la
  BD). Usuarios de desarrollo: `admin/admin123` y `usuario/usuario123`.
- `MicroServicios` usa **ruff**, no black/flake8: `.venv/bin/ruff check .` y
  `.venv/bin/ruff format .` (line-length 100).
- `pyproject.toml` exige `requires-python = ">=3.12"` (el README dice 3.10; **manda el
  `pyproject.toml`**).

## Tests

Solo hay tests en `Security` (`./mvnw test`) y `MicroServicios` (`.venv/bin/pytest`).
`FrontEnd` y `BackEnd` **no tienen runner de tests**: para verificarlos, `typecheck` +
`lint`, y a mano con los `curl` de la tabla del README.

Quirk de `MicroServicios/tests/test_photos_api.py`: `photo_service` es un **singleton a
nivel de módulo**, así que el estado persiste entre tests del mismo proceso. Por eso
`test_create_and_list_photos` afirma `len(...) == 1`. Si añades un test que cree fotos,
rompe ese `== 1`; reinicia el dict o ajusta el test.

## Convenciones de código

- Comentarios, identificadores de negocio y documentación **en español**, sin tildes ni
  ñ en el código (el proyecto los escribe así: `contrasena`, `autenticacion`). Mantén
  ese estilo al añadir código.
- Prettier manda en TS: comillas simples, `printWidth` 100, 2 espacios. Ruff en Python
  (4 espacios, línea 100). **Java no tiene formateador configurado**: imita el estilo del
  archivo que editas (tabs en Spring Boot).
- Cuando `.editorconfig` y el formateador chocan, gana el formateador.
- Nunca commitees un `.env`: se copia de `.env.example` y está en `.gitignore`. Solo
  las variables con prefijo `VITE_` llegan al navegador, así que nunca pongas ahí un
  secreto.
- Commits: **Conventional Commits en español**, con el directorio como scope, p. ej.
  `feat(backEnd): anade middleware de validacion JWT`,
  `fix(frontEnd): corrige el envio del token en el interceptor`.

## Documentación

Los diagramas están acoplados entre sí: el `.puml` es la fuente y el `.md` se regenera.
Después de tocar cualquier `.puml`, ejecuta desde la raíz:

```bash
pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1 -Comprobar   # solo informa
pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1 -Solo clases # una carpeta
```

Los bloques ```plantuml se emparejan **por posición, no por nombre**. Si añades un
`.puml`, el número de bloques ```plantuml del `.md` tiene que coincidir exactamente con
el número de `.puml` de la carpeta, o el script se niega a tocar el documento.

## Estado del proyecto

Es un proyecto académico de documentación + esqueleto. Antes de implementar algo, mira
la tabla de "Estado del proyecto" del README y `docs/secuencia.md`, que marca qué flujo
existe en código y cuál solo está especificado. Pendientes conocidos: validación del
JWT en `BackEnd`, registro por invitación, posts/comentarios/reacciones, modelo
entidad-relación.

## Memoria

siempre actualiza /MEMORY.md
