const express = require('express');
const authenticateJWT = require('../middleware/authMiddleware');  // Import the JWT authentication middleware
const router = express.Router();

// Route to fetch user data, protected by JWT middleware
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    // The user is available from the `req.user` object due to the JWT middleware
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
