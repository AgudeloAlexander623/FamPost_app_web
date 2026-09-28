// src/services/security.service.ts -> cliente del microservicio de seguridad (Java)
import axios from 'axios';

import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export interface LoginResult {
  token: string;
  username: string;
  roles: string[];
}

const http = axios.create({
  baseURL: env.securityServiceUrl,
  timeout: 8000,
});

export const securityService = {
  async login(username: string, password: string): Promise<LoginResult> {
    try {
      const { data } = await http.post<LoginResult>('/login', { username, password });
      return data;
    } catch (error) {
      logger.error('Fallo al autenticar contra el servicio de seguridad', error);
      throw new AppError(502, 'El servicio de autenticacion no esta disponible');
    }
  },
};
