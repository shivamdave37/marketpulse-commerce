import dotenv from 'dotenv';

dotenv.config();

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
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
