const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Search route
router.get('/search', searchProducts);

// Product routes
router.route('/')
  .get(getProducts)
  .post( createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router; 