const { body, param, validationResult } = require('express-validator');

/**
 * Order Validation Rules
 * 
 * Order Schema:
 *   - User ID: MongoDB ObjectId reference to User
 *   - Shipping Address: String (required)
 *   - Date: Date (defaults to current date)
 *   - Payment Method: String (enum: 'Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery')
 *   - Tracking Number: String (optional, generated after shipping)
 *   - Book IDs: Array of MongoDB ObjectIds referencing Books
 */

// Validation rules for creating a new order
const createOrderValidation = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),

  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Shipping address must be between 10 and 500 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date format')
    .toDate(),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'])
    .withMessage('Payment method must be one of: Credit Card, Debit Card, PayPal, Cash on Delivery'),

  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters')
    .isAlphanumeric()
    .withMessage('Tracking number must contain only letters and numbers'),

  body('bookIds')
    .isArray({ min: 1 })
    .withMessage('Book IDs must be an array with at least one book'),

  body('bookIds.*')
    .isMongoId()
    .withMessage('Each Book ID must be a valid MongoDB ObjectId')
];

// Validation rules for updating an order (all fields required)
const updateOrderValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),

  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),

  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Shipping address must be between 10 and 500 characters'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date format')
    .toDate(),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'])
    .withMessage('Payment method must be one of: Credit Card, Debit Card, PayPal, Cash on Delivery'),

  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters')
    .isAlphanumeric()
    .withMessage('Tracking number must contain only letters and numbers'),

  body('bookIds')
    .isArray({ min: 1 })
    .withMessage('Book IDs must be an array with at least one book'),

  body('bookIds.*')
    .isMongoId()
    .withMessage('Each Book ID must be a valid MongoDB ObjectId')
];

// Validation for getting/deleting a single order by ID
const orderIdValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId')
];

// Validation for getting orders by user ID
const userIdParamValidation = [
  param('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId')
];

// Middleware to check validation results and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  createOrderValidation,
  updateOrderValidation,
  orderIdValidation,
  userIdParamValidation,
  validate
};