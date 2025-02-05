require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const gameRoutes = require('./routes/gameRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true // Allow credentials
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}  - Request received`);
  next();
});


app.use('/api', gameRoutes);


// server.js
app.get('/api/user', (req, res) => {
    if (req.session.username) {
        return res.json({ username: req.session.username });
    } else {
        return res.status(401).json({ message: 'Not logged in' });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Game Service is running on port http://localhost:${PORT}`);
});
