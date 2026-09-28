# FrontEnd - React + TypeScript + Vite

Interfaz web de Photos APP.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

Queda en <http://localhost:5173>. Vite hace de proxy de `/api` hacia
`http://localhost:4000`, asi que en desarrollo no hay problemas de CORS.

## Scripts

| Comando           | Que hace                                |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con hot reload    |
| `npm run build`   | Comprueba los tipos y genera `dist/`     |
| `npm run preview` | Sirve la build de produccion             |
| `npm run typecheck` | Solo la comprobacion de tipos          |
| `npx eslint .`    | Linter (ESLint + typescript-eslint)      |
| `npx prettier .`  | Formateador                             |

## Estructura

```
src/
  components/   Componentes reutilizables (NavBar)
  pages/        Vistas ligadas a rutas (HomePage, LoginPage)
  services/     Cliente HTTP (axios) con interceptor de token
  types/        Interfaces de TypeScript
  App.tsx       Rutas de la aplicacion
  main.tsx      Punto de entrada
```

## Variables de entorno

Solo las que empiezan por `VITE_` se exponen al navegador (ver `.env.example`).
Para usar rutas absolutas en lugar del proxy, pon
`VITE_API_URL=http://localhost:4000/api` y anade el backend a la lista de CORS.
