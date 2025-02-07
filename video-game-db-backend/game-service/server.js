require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const gameRoutes = require('./routes/gameRoutes');

const PORT = process.env.PORT || 3001;
const app = express();


app.use(express.json());
app.use(cors({
  credentials: true 
}));


app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}  - Request received`);
  next();
});


app.use('/api', gameRoutes);


app.get('/api/user', (req, res) => {
    if (req.session.username) {
        return res.json({ username: req.session.username });
    } else {
        return res.status(401).json({ message: 'Not logged in' });
    }
});

// Add near your other routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


app.listen(PORT, () => {
  console.log(`Game Service is running on port http://localhost:${PORT}`);
});
