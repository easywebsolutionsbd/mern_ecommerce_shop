const { check } = require('express-validator');

// User registration validation rules
const registerValidationRules = [
  check('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  check('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// User login validation rules
const loginValidationRules = [
  check('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
];

module.exports = {
  registerValidationRules,
  loginValidationRules
}; 