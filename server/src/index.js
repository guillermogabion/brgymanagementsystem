const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
const frontendUrl = 'https://brgymanagementsystem-eta.vercel.app';

// 1. Use the middleware (remove the manual app.options block below this) this is for prod
// app.use(cors({
//   origin: frontendUrl,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors()); // local

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

//  uncomment for local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
  });
}
// IMPORTANT: export app for vercel
module.exports = app;
