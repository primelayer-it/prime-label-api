const express = require('express');
const {
  getLabels,
  getLabelById,
  getLabelByBatchNumber,
  getLabelByProtocolAndKit,
  getLabelByIdentifier,
  getLabelBySponsorTrialBatch,
  getLabelBySponsorTrialKit,
} = require('../controllers/labelController');
const { validateLabel, validateLabelParams, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * Label Routes with Data Validation
 * Each route includes appropriate validation middleware
 * to ensure data accuracy and compliance
 */

// Create new label - validates all required fields
router.post(
  '/',
  validateLabel,
  handleValidationErrors,
  // your existing controller
);

// Get label by ID - validates ID format
router.get(
  '/:id',
  validateLabelParams,
  handleValidationErrors,
  // your existing controller
);

// Update label - validates update data
router.put(
  '/:id',
  validateLabelParams,
  validateLabel,
  handleValidationErrors,
  // your existing controller
);

// Get labels by batch - validates batch number format
router.get(
  '/batch/:batchNumber',
  validateLabelParams,
  handleValidationErrors,
  // your existing controller
);

// Get labels by lot - validates lot number format
router.get(
  '/lot/:lotNumber',
  validateLabelParams,
  handleValidationErrors,
  // your existing controller
);

// Dedicated lookup endpoints
router.get('/identifier/:identifierCode', getLabelByIdentifier);
router.get('/:sponsorName/:trialIdentifier/batch/:batchNumber', getLabelBySponsorTrialBatch);
router.get('/:sponsorName/:trialIdentifier/kit/:kitNumber', getLabelBySponsorTrialKit);

// Generic endpoints
router.get('/', getLabels);
router.get('/:id', getLabelById);
router.get('/batch/:batchNumber', getLabelByBatchNumber);
router.get('/protocol/:protocolNumber/kit/:kitNumber', getLabelByProtocolAndKit);

module.exports = router;
