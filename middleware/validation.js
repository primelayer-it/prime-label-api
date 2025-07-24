const { body, param, validationResult } = require('express-validator');

/**
 * Validates label data to ensure accuracy and compliance
 * Checks for:
 * - Valid batch/lot numbers format
 * - Date formats
 * - Required fields
 * - Data type correctness
 */

// Validation rules for batch numbers and lot numbers
const batchLotFormat = /^[A-Z0-9_-]+$/; // Only allow uppercase letters, numbers, underscore, hyphen
const yearFormat = /^20\d{2}$/; // Year must be 20XX format

// Common validation patterns
const commonPatterns = {
  companyName: /^[A-Za-z0-9\s&.-]+$/, // Letters, numbers, spaces, &, dots, hyphens
  batchNumber: /^[A-Z0-9-]+$/, // Uppercase letters, numbers, hyphens
  lotNumber: /^LOT_[A-Z0-9]+$/, // LOT_ followed by uppercase letters and numbers
};

/**
 * Validates label creation/update requests
 * Ensures all required fields are present and correctly formatted
 */
const validateLabel = [
  // Company name validation
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .matches(commonPatterns.companyName)
    .withMessage('Invalid company name format')
    .isLength({ max: 100 })
    .withMessage('Company name too long'),

  // Year validation
  body('year').notEmpty().withMessage('Year is required').matches(yearFormat).withMessage('Year must be in 20XX format'),

  // Batch number validation
  body('batchNumber')
    .notEmpty()
    .withMessage('Batch number is required')
    .matches(commonPatterns.batchNumber)
    .withMessage('Invalid batch number format')
    .isLength({ min: 3, max: 20 })
    .withMessage('Batch number must be between 3-20 characters'),

  // Lot number validation
  body('lotNumber')
    .notEmpty()
    .withMessage('Lot number is required')
    .matches(commonPatterns.lotNumber)
    .withMessage('Lot number must start with LOT_ followed by alphanumeric characters')
    .isLength({ max: 20 })
    .withMessage('Lot number too long'),

  // Quantity validation (if present)
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive number'),

  // Expiry date validation (if present)
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format - use YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Expiry date cannot be in the past');
      }
      return true;
    }),
];

/**
 * Validates URL parameters for label lookups
 * Ensures proper format of IDs and reference numbers
 */
const validateLabelParams = [
  param('id')
    .if(param('id').exists())
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Invalid ID format'),

  param('batchNumber').if(param('batchNumber').exists()).matches(commonPatterns.batchNumber).withMessage('Invalid batch number format'),

  param('lotNumber').if(param('lotNumber').exists()).matches(commonPatterns.lotNumber).withMessage('Invalid lot number format'),
];

/**
 * Middleware to handle validation errors
 * Returns detailed error messages for invalid data
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateLabel,
  validateLabelParams,
  handleValidationErrors,
};
