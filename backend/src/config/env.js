import dotenv from 'dotenv';

dotenv.config();

function parseAllowedOrigins(value) {
  return (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databasePoolUrl: process.env.DATABASE_POOL_URL || '',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/marketpulse',
  dbPoolMax: Number(process.env.DB_POOL_MAX || 20),
  dbIdleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  defaultUserId:
    process.env.DEFAULT_USER_ID || '11111111-1111-1111-1111-111111111111',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedOrigins: parseAllowedOrigins(
    process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL
  )
};
