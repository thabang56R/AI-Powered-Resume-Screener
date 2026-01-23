// src/app.js
import express from 'express';
import cors from 'cors';

import resumeRoutes from './routes/resumeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', resumeRoutes);


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (last)
app.use(errorHandler);

export default app;