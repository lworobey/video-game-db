const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();  // Use router, not app instance

// Middleware for sessions and Passport
router.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',  // Provide a secret key here
  resave: false,
  saveUninitialized: true,
}));

router.use(passport.initialize());
router.use(passport.session());

// Routes
router.get('/login', authController.login);  // Redirect to Discord OAuth login
router.get('/callback', authController.callback);  // Callback to handle response from Discord

module.exports = router;  // Export router for use in server.js
