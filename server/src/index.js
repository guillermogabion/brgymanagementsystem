const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
const frontendUrl = 'https://brgymanagementsystem-eta.vercel.app';

app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight OPTIONS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', frontendUrl);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send("Barangay API is running...");
});

const userRoutes = require('./routes/userRoutes');
const residentRoutes = require('./routes/residentRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.use('/api/users', userRoutes);
app.use('/api/residents', authenticateToken, residentRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);

// IMPORTANT: export app for vercel
module.exports = app;
