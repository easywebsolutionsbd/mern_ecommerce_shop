const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderToPaid
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes 
router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrder);

router.route('/:id/pay')
  .put(updateOrderToPaid);

module.exports = router; 