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

const { validateSponsorTrialBatch, validateSponsorTrialKit, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Dedicated lookup endpoints
router.get('/identifier/:identifierCode', getLabelByIdentifier);

// Sponsor/Trial/Batch endpoint with validation
router.get('/:sponsorName/:trialIdentifier/batch/:batchNumber', validateSponsorTrialBatch, handleValidationErrors, getLabelBySponsorTrialBatch);

// Sponsor/Trial/Kit endpoint with validation
router.get('/:sponsorName/:trialIdentifier/kit/:kitNumber', validateSponsorTrialKit, handleValidationErrors, getLabelBySponsorTrialKit);

// Generic endpoints
router.get('/', getLabels);
router.get('/:id', getLabelById);
router.get('/batch/:batchNumber', getLabelByBatchNumber);
router.get('/protocol/:protocolNumber/kit/:kitNumber', getLabelByProtocolAndKit);

module.exports = router;
