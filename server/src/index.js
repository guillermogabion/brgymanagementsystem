const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// 1. Define the origin exactly as it appears in the browser error
const frontendUrl = 'https://brgymanagementsystem-eta.vercel.app';

app.use(cors({
  origin: frontendUrl, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 2. Extra safety: Manual header injection for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', frontendUrl);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// app.use(cors());
// app.use(express.json()); // Essential for CRUD to read JSON body

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic Route for testing
app.get('/', (req, res) => {
    res.send("Barangay API is running...");
});

// Import and use User Routes (We will create this next)
const userRoutes = require('./routes/userRoutes');
const residentRoutes = require('./routes/residentRoutes');
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/users', userRoutes);
app.use('/api/residents', authenticateToken, residentRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);


app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});

module.exports = app;