import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import reviewsRouter from './routes/reviews';
import mongoose from 'mongoose';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend origin
  credentials: true
}));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Mount routes
app.use('/api/users', usersRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/reviews', reviewsRouter);

// Test route with detailed response
app.get('/api/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({
    message: 'Backend is working',
    time: new Date().toISOString(),
    headers: req.headers,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      mongoDbConnected: !!mongoose.connection.readyState
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
  console.log('Available routes:');
  console.log('- POST /api/users/register');
  console.log('- POST /api/users/login');
  console.log('- GET /api/users/profile');
}); 