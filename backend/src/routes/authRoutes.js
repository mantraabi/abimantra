// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint: POST {backendURL}/api/auth/register
router.post('/register', authController.register);
router.post('/google', authController.googleLogin);
router.post('/verify-otp', authController.verifyOTP);

// Endpoint: POST {backendURL}/api/auth/login
router.post('/login', authController.login);

module.exports = router;