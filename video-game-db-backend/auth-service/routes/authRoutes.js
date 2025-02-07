const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();  

router.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

router.use(passport.initialize());
router.use(passport.session());


router.get('/login', authController.login);  // Redirect to Discord OAuth login
router.get('/callback', authController.callback);  // Callback to handle response from Discord

module.exports = router;  
