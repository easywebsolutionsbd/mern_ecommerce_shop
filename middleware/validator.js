const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length > 0) {
    return res.status(400).json({
      errors: Object.values(mappedErrors).map(error => error.msg)
    });
  }
  next();
};

module.exports = { validate }; 