const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies
  if (req.signedCookies.token) {
    token = req.signedCookies.token;
  }
  // Check if token exists in headers
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request object
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Middleware to check if user is already authenticated
exports.checkAlreadyAuthenticated = (req, res, next) => {
  if (req.signedCookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
    return res.status(403).json({
      success: false,
      error: 'User is already logged in'
    });
  }

  else{
    res.status(200).json({
      success: true,
      message: 'User is not logged in'
    });
    }
}; 