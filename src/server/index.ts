import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './api';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Подключаем статику (Vite build)
app.use(express.static(path.join(__dirname, '../../dist')));

// ✅ SPA fallback — всё рендерит index.html
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// ✅ API routes
app.use('/api', router);

// ✅ Healthcheck
app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

// ✅ Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// ✅ Запуск сервера на 0.0.0.0 (Railway требует именно так)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔍 API: http://0.0.0.0:${PORT}/api/analyze-meal`);
});
