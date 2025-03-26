const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addToCompareList,
  removeFromCompareList,
  getCompareList
} = require('../controllers/userController');
const { protect, checkAlreadyAuthenticated } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { registerValidationRules, loginValidationRules } = require('../utils/validationRules');

const router = express.Router();

// Auth routes
router.get('/register', checkAlreadyAuthenticated);
router.get('/login', checkAlreadyAuthenticated);

router.post('/register', registerValidationRules, validate, registerUser);
router.post('/login', loginValidationRules, validate, loginUser);
router.get('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

// Wishlist routes
router.route('/wishlist')
  .get(protect, getWishlist);

router.route('/wishlist/:productId')
  .put(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

// Compare list routes
router.route('/compare')
  .get(protect, getCompareList);

router.route('/compare/:productId')
  .put(protect, addToCompareList)
  .delete(protect, removeFromCompareList);

module.exports = router; 