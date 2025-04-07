import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './api.js';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// API routes
app.use('/api', router);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/analyze-meal`);
});
