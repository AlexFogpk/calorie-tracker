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
  // Enhanced logging for the global error handler
  console.error(`\n--- Global Server Error Handler Caught An Error ---`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error(`Request URL: ${req.originalUrl}`);
  console.error(`Request Method: ${req.method}`);
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Message: ${err.message}`);
  console.error(`Error Stack: ${err.stack}`);
  // Log the raw error object if possible
  console.error(`Raw Error Object:`, err);
  
  // Avoid sending stack trace in production
  const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так';
  const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  // Ensure response is sent only once
  if (!res.headersSent) {
  res.status(500).json({
      success: false,
    error: 'Internal Server Error',
      message: errorMessage,
      stack: errorStack // Include stack in dev mode
  });
  } else {
     // If headers already sent, delegate to default Express handler
     next(err);
  }
});

// ✅ Запуск сервера на 0.0.0.0 (Railway требует именно так)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔍 API: http://0.0.0.0:${PORT}/api/analyze-meal`);
});
