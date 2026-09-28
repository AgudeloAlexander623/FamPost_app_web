// src/utils/logger.ts -> logger minimo para no depender de winston en el campus
const timestamp = (): string => new Date().toISOString();

export const logger = {
  info(message: string): void {
    console.log(`[${timestamp()}] INFO  ${message}`);
  },
  warn(message: string): void {
    console.warn(`[${timestamp()}] WARN  ${message}`);
  },
  error(message: string, error?: unknown): void {
    console.error(`[${timestamp()}] ERROR ${message}`, error ?? '');
  },
};
