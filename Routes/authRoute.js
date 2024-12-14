const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../Controllers/authController');
const { validateRequest } = require('../Middleware/validator');
const { authenticateToken } = require('../Middleware/auth');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.post('/forgot-password', body('email').isEmail(), validateRequest, authController.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
], validateRequest, authController.resetPassword);

module.exports = router;