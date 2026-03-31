import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/marketpulse',
  defaultUserId:
    process.env.DEFAULT_USER_ID || '11111111-1111-1111-1111-111111111111',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

