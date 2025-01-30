const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.login);      // Redirect to Discord OAuth
router.get('/callback', authController.callback); // Handle Discord OAuth response

module.exports = router;
