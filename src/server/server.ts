import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from './middleware/errorHandler';
import authRouter from './api/auth';
import quotesRouter from './api/quotes';
import ordersRouter from './api/orders';
import catalogRouter from './api/catalog';
import settingsRouter from './api/settings';
import dbStatusRouter from './api/db-status';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// API routes - Make sure these come BEFORE static file serving
app.use('/api/auth', authRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/db-status', dbStatusRouter);

// API 404 handler - Must come AFTER API routes but BEFORE static serving
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Static file serving and client-side routing - Must come AFTER API routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    }
  });
}

// Error handling middleware - Must be last
app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});