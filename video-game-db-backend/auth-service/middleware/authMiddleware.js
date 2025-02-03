const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Your User model

// Middleware to authenticate JWT
const authenticateJWT = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token with the secret key

    // Use discordId (which is a string) instead of _id (ObjectId)
    const user = await User.findOne({ discordId: decoded.discordId });
    if (!user) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }

    req.user = user;  // Attach the user to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateJWT;
