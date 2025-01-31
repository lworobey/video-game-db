require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Serve search at `/api/search`
app.use('/api', gameRoutes); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Game Service is running on port http://localhost:${PORT}`);
});
