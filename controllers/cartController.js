const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price imageUrl'
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], totalPrice: 0 }
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return next(new ErrorResponse('Please provide product ID and quantity', 400));
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }

    // Check if product is in stock
    if (!product.inStock || product.quantity < quantity) {
      return next(new ErrorResponse('Product is out of stock or insufficient quantity', 400));
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product not in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    // Validate input
    if (!quantity) {
      return next(new ErrorResponse('Please provide quantity', 400));
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return next(new ErrorResponse('Item not found in cart', 404));
    }

    // Check if product is in stock
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }

    if (!product.inStock || product.quantity < quantity) {
      return next(new ErrorResponse('Product is out of stock or insufficient quantity', 400));
    }

    // Update quantity
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return next(new ErrorResponse('Item not found in cart', 404));
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Save cart
    await cart.save();

    // Return updated cart
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    // Clear items and reset total price
    cart.items = [];
    cart.totalPrice = 0;

    // Save cart
    await cart.save();

    // Return updated cart
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
}; 