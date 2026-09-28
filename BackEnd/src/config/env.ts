// src/config/env.ts -> variables de entorno tipadas y validadas
import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const nodeEnv = required('NODE_ENV', 'development');
const isDevelopment = nodeEnv === 'development';

export const env = {
  nodeEnv,
  isDevelopment,
  port: Number(required('PORT', '4000')),
  corsOrigin: toList(required('CORS_ORIGIN', 'http://localhost:5173')),
  securityServiceUrl: required('SECURITY_SERVICE_URL', 'http://localhost:8080/api/auth'),
  photosServiceUrl: required('PHOTOS_SERVICE_URL', 'http://localhost:8000/api/v1'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-no-usar-en-produccion'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '3600'),

  // Base de datos PostgreSQL
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(required('DB_PORT', '5432')),
    name: required('DB_NAME', 'photos_app'),
    user: required('DB_USER', 'postgres'),
    password: required('DB_PASSWORD', 'postgres'),
    ssl: (process.env.DB_SSL ?? 'false').toLowerCase() === 'true',
    logging: (process.env.DB_LOGGING ?? (isDevelopment ? 'error,warn,migration' : 'error'))
      .split(',')
      .map((level) => level.trim())
      .filter(Boolean),
  },
} as const;
