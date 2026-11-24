require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable.');
  process.exit(1);
}

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use((_req, res) => {
  return res.status(404).json({ error: 'Route not found.' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`TaskFlow API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database or start server:', err.message);
    process.exit(1);
  }
}

start();
