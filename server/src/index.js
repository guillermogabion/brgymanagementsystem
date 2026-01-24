const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "https://brgymanagementsystem-eta.vercel.app/"
}));
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