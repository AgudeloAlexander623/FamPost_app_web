# BackEnd - Node.js + TypeScript + Express

API principal de Photos APP. Valida el token que emite el servicio de seguridad,
guarda los datos en PostgreSQL y delega el procesamiento pesado al microservicio
de Python.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run db:create      # crea la base de datos si no existe
npm run db:migrate     # crea las tablas
npm run db:seed        # (opcional) inserta 2 fotos de ejemplo
npm run dev
```

Queda en <http://localhost:4000>. Prueba rapida:

```bash
curl http://localhost:4000/api/health
# {"status":"ok",...,"database":"connected",...}
```

## Scripts

| Comando               | Que hace                                        |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | `tsx watch`: recarga al guardar                 |
| `npm run build`       | Compila TypeScript a `dist/`                    |
| `npm start`           | Ejecuta la build (`node dist/index.js`)         |
| `npm run typecheck`   | Comprueba los tipos sin generar nada            |
| `npm run lint`        | ESLint                                          |
| `npm run format`      | Prettier                                        |
| `npm run db:create`   | `CREATE DATABASE` si no existe                  |
| `npm run db:migrate`  | Aplica las migraciones pendientes               |
| `npm run db:revert`   | Deshace la ultima migracion                     |
| `npm run db:seed`     | Inserta datos de ejemplo (si la tabla esta vacia)|

## Base de datos (PostgreSQL + TypeORM)

- Driver: `pg` (node-postgres). ORM: `typeorm`.
- Conexion en `src/config/database.ts` (exporta `AppDataSource`).
- Variables en `.env`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
  `DB_SSL`, `DB_LOGGING`.

```
src/
  config/database.ts    DataSource de TypeORM + checkDatabase()
  entities/Photo.ts     Entidad Photo -> tabla "photos"
  migrations/           Migraciones versionadas
  database/
    seed.ts             Datos de ejemplo
    cli/                Scripts db:create, db:migrate, db:revert, db:seed
  services/             photo.service.ts (accede con AppDataSource)
  controllers/          ...
  middlewares/          404 y manejador global de errores
  routes/               Definicion de rutas
  utils/                AppError, asyncHandler, logger
  app.ts                Construccion de la app Express
  index.ts              Arranque: conecta la base de datos y levanta el servidor
```

Reglas de la configuracion:

- `synchronize` esta en **false**: las tablas se crean solo con migraciones.
- El servidor **arranca igual** si PostgreSQL no esta levantado, pero
  `/api/health` devuelve `503` con `"database":"unavailable"`.
- Para crear una migracion nueva: escribe la clase en `src/migrations/` y
  anadela al array `migrations` de `src/config/database.ts`.

## Rutas

| Metodo | Ruta               | Descripcion                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/api/health`      | Estado del servicio y de la base de datos |
| POST   | `/api/auth/login`  | Reenvia credenciales a `Security`  |
| GET    | `/api/photos`      | Lista las fotos de PostgreSQL      |
| GET    | `/api/photos/:id`  | Obtiene una foto por UUID           |
| POST   | `/api/photos`      | Crea una foto                       |
| DELETE | `/api/photos/:id`  | Borra una foto                      |

Ejemplo:

```bash
curl -X POST http://localhost:4000/api/photos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mi foto","url":"https://example.com/foto.jpg","userId":"admin"}'
```

## Nota sobre npm 11

npm 11 no ejecuta los scripts de instalacion de las dependencias. Si `tsx` o Vite
fallan con un error de binario, ejecuta:

```bash
npm rebuild esbuild --foreground-scripts
```
