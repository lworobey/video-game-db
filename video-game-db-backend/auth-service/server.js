const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables from .env file
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  // Authentication routes
const userRoutes = require('./routes/userRoutes');  // User data routes

const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true // Allow credentials
}));
app.use(express.json());  // Parse JSON request bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - Request received`);
  next();
});

// Routes
app.use('/auth', authRoutes);  // Authentication routes
app.use('/api', userRoutes);   // User data routes

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
