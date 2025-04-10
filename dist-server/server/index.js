"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const api_1 = __importDefault(require("./api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// ✅ Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Подключаем статику (Vite build)
app.use(express_1.default.static(path_1.default.join(__dirname, '../../dist')));
// ✅ SPA fallback — всё рендерит index.html
app.get('/', (_, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../dist', 'index.html'));
});
// ✅ API routes
app.use('/api', api_1.default);
// ✅ Healthcheck
app.get('/health', (_, res) => {
    res.status(200).send('OK');
});
// ✅ Error handler
app.use((err, req, res, next) => {
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
    }
    else {
        // If headers already sent, delegate to default Express handler
        next(err);
    }
});
// ✅ Запуск сервера на 0.0.0.0 (Railway требует именно так)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔍 API: http://0.0.0.0:${PORT}/api/analyze-meal`);
});
