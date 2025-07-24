const { body, param, validationResult } = require('express-validator');

// Common validation patterns
const commonPatterns = {
  sponsorName: /^[A-Za-z0-9\s&.-]+$/, // Letters, numbers, spaces, &, dots, hyphens
  trialIdentifier: /^[A-Z0-9-]+$/, // Uppercase letters, numbers, hyphens
  batchNumber: /^[A-Z0-9-]+$/, // Uppercase letters, numbers, hyphens
  kitNumber: /^\d{6}$/, // Exactly 6 digits
};

/**
 * Validates sponsor/trial/batch endpoint parameters
 */
const validateSponsorTrialBatch = [
  param('sponsorName')
    .trim()
    .notEmpty()
    .withMessage('Sponsor name is required')
    .matches(commonPatterns.sponsorName)
    .withMessage('Invalid sponsor name format')
    .isLength({ max: 100 })
    .withMessage('Sponsor name too long'),

  param('trialIdentifier')
    .trim()
    .notEmpty()
    .withMessage('Trial identifier is required')
    .matches(commonPatterns.trialIdentifier)
    .withMessage('Invalid trial identifier format')
    .isLength({ min: 3, max: 20 })
    .withMessage('Trial identifier must be between 3-20 characters'),

  param('batchNumber')
    .trim()
    .notEmpty()
    .withMessage('Batch number is required')
    .matches(commonPatterns.batchNumber)
    .withMessage('Invalid batch number format')
    .isLength({ min: 3, max: 20 })
    .withMessage('Batch number must be between 3-20 characters'),
];

/**
 * Validates sponsor/trial/kit endpoint parameters
 */
const validateSponsorTrialKit = [
  param('sponsorName')
    .trim()
    .notEmpty()
    .withMessage('Sponsor name is required')
    .matches(commonPatterns.sponsorName)
    .withMessage('Invalid sponsor name format')
    .isLength({ max: 100 })
    .withMessage('Sponsor name too long'),

  param('trialIdentifier')
    .trim()
    .notEmpty()
    .withMessage('Trial identifier is required')
    .matches(commonPatterns.trialIdentifier)
    .withMessage('Invalid trial identifier format')
    .isLength({ min: 3, max: 20 })
    .withMessage('Trial identifier must be between 3-20 characters'),

  param('kitNumber')
    .trim()
    .notEmpty()
    .withMessage('Kit number is required')
    .matches(commonPatterns.kitNumber)
    .withMessage('Kit number must be exactly 6 digits'),
];

/**
 * Handles validation errors
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
  validateSponsorTrialBatch,
  validateSponsorTrialKit,
  handleValidationErrors,
};
