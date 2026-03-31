import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { requestUser } from './middleware/requestUser.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

app.use(
  cors({
    origin: env.frontendUrl
  })
);
app.use(express.json());
app.use(requestUser);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/catalog', catalogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customer', customerRoutes);

app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.use((error, _req, res, _next) => {
  res.status(400).json({
    message: error.message || 'Something went wrong.'
  });
});
