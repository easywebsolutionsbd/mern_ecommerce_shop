const User = require('../models/User');

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
     throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      errors : [err.message]
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/users/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  res.clearCookie(process.env.COOKIE_NAME);

  res.status(200).json({
    success: true,
  });
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to wishlist
// @route   PUT /api/users/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishlist: req.params.productId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishlist: req.params.productId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to compare list
// @route   PUT /api/users/compare/:productId
// @access  Private
exports.addToCompareList = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { compareList: req.params.productId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.compareList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from compare list
// @route   DELETE /api/users/compare/:productId
// @access  Private
exports.removeFromCompareList = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { compareList: req.params.productId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.compareList
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user compare list
// @route   GET /api/users/compare
// @access  Private
exports.getCompareList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('compareList');

    res.status(200).json({
      success: true,
      data: user.compareList
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires:  new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    signed: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production' ? true : false
  };

  res.cookie(process.env.COOKIE_NAME, token, options);
  res
    .status(statusCode)
    .json({
      success: true,
      token, 
      user
    });
};  