import { useEffect, useState } from 'react';

import { api } from '../services/api';
import type { HealthStatus } from '../types';

export function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<HealthStatus>('/health')
      .then((response) => setHealth(response.data))
      .catch(() => setError('El backend no responde en http://localhost:4000'));
  }, []);

  return (
    <section>
      <h1>Photos APP</h1>
      <p>Frontend en React + TypeScript. Habla con el backend a traves de /api.</p>

      {error && <p className="error">{error}</p>}

      {health ? (
        <ul>
          <li>Servicio: {health.service}</li>
          <li>Estado: {health.status}</li>
          <li>Entorno: {health.environment}</li>
          {health.database && <li>Base de datos: {health.database}</li>}
        </ul>
      ) : (
        !error && <p>Consultando estado del backend...</p>
      )}
    </section>
  );
}
