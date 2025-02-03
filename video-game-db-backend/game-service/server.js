require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use('/api', gameRoutes);

// server.js
app.get('/api/user', (req, res) => {
    if (req.session.username) {
        return res.json({ username: req.session.username });
    } else {
        return res.status(401).json({ message: 'Not logged in' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Game Service is running on port http://localhost:${PORT}`);
});
