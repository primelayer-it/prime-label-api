const LabelTemplate = require("../models/LabelTemplate");

// @desc    Get all label templates
// @route   GET /api/templates
async function getTemplates(req, res, next) {
  try {
    const templates = await LabelTemplate.find();
    console.log("Found templates:", templates.length);
    res.json(templates);
  } catch (err) {
    next(err);
  }
}

// @desc    Get a single template by ID
// @route   GET /api/templates/:id
async function getTemplateById(req, res, next) {
  try {
    const template = await LabelTemplate.findById(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
};
