const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, subtotal, tax, shipping, total } = req.body;

    // Validate input
    if (!shippingAddress || !paymentMethod) {
      return next(new ErrorResponse('Please provide shipping address and payment method', 400));
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price imageUrl quantity inStock'
    });

    if (!cart || cart.items.length === 0) {
      return next(new ErrorResponse('Cart is empty', 400));
    }

    // Check if all items are in stock
    for (const item of cart.items) {
      const product = item.product;
      
      if (!product.inStock || product.quantity < item.quantity) {
        return next(new ErrorResponse(`${product.name} is out of stock or has insufficient quantity`, 400));
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => {
      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.product.imageUrl
      };
    });

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total
    });

    // Update product quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns order
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this order', 401));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns order
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this order', 401));
    }

    // Update order
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (err) {
    next(err);
  }
}; 