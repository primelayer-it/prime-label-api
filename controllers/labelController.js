const Label = require('../models/Label');
const LabelTemplate = require('../models/LabelTemplate');

// Create a new label
const createLabel = async (req, res) => {
  try {
    const label = await Label.create(req.body);
    res.status(201).json(label);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all labels (optionally filter by type/version)
// @route   GET /api/labels
async function getLabels(req, res, next) {
  try {
    const { labelType, templateVersion } = req.query;
    const filter = {};
    if (labelType) filter.labelType = labelType;
    if (templateVersion) filter.templateVersion = templateVersion;
    const labels = await Label.find(filter);
    res.json(labels);
  } catch (err) {
    next(err);
  }
}

// @desc    Get a single label by ID
// @route   GET /api/labels/:id
async function getLabelById(req, res, next) {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) return res.status(404).json({ message: 'Label not found' });
    res.json(label);
  } catch (err) {
    next(err);
  }
}

// @desc    Get a single label by batchNumber
// @route   GET /api/labels/batch/:batchNumber
async function getLabelByBatchNumber(req, res, next) {
  try {
    const { batchNumber } = req.params;
    const label = await Label.findOne({ batchNumber });
    if (!label) return res.status(404).json({ message: 'Label not found for batch Number' + batchNumber });
    res.json(label);
  } catch (err) {
    next(err);
  }
}

// @desc    Get a single label by protocolNumber and kitNumber
// @route   GET /api/labels/protocol/:protocolNumber/kit/:kitNumber
async function getLabelByProtocolAndKit(req, res, next) {
  try {
    const { protocolNumber, kitNumber } = req.params;
    const label = await Label.findOne({ protocolNumber, kitNumber });
    if (!label) {
      return res.status(404).json({
        message: 'Label not found for protocol ${protocolNumber} and kit ${kitNumber} ',
      });
    }
    res.json(label);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/labels/identifier/:identifierCode
 */
async function getLabelByIdentifier(req, res, next) {
  try {
    const { identifierCode } = req.params;
    const label = await Label.findOne({ identifierCode });
    if (!label) {
      return res.status(404).json({ message: 'Label not found for that identifierCode' });
    }
    res.json(label);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/labels/:sponsor/:trialIdentifier/batch/:batchNumber
 */
async function getLabelBySponsorTrialBatch(req, res, next) {
  try {
    const { sponsorName, trialIdentifier, batchNumber } = req.params;
    const label = await Label.findOne({
      sponsorName,
      trialIdentifier,
      batchNumber,
    });

    if (!label) {
      return res.status(404).json({ message: 'Label not found for that sponsor/trial/batch' });
    }
    res.json(label);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/labels/:sponsor/:trialIdentifier/kit/:kitNumber
 */
async function getLabelBySponsorTrialKit(req, res, next) {
  try {
    const { sponsorName, trialIdentifier, kitNumber } = req.params;
    const label = await Label.findOne({
      sponsorName,
      trialIdentifier,
      kitNumber,
    });

    if (!label) {
      return res.status(404).json({ message: 'Label not found for that sponsor/trial/kit' });
    }
    res.json(label);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLabel,
  getLabels,
  getLabelById,
  getLabelByBatchNumber,
  getLabelByProtocolAndKit,
  getLabelByIdentifier,
  getLabelBySponsorTrialBatch,
  getLabelBySponsorTrialKit,
};
