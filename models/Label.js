const mongoose = require("mongoose");

const LabelSchema = new mongoose.Schema({
  labelType: { type: String, required: true },
  templateVersion: { type: Number, required: true },

  // Required core fields (not translatable)
  trialIdentifier: { type: String, required: true },
  sponsorName: { type: String, required: false },
  protocolNumber: { type: String, required: true },
  productName: { type: String, required: true },
  identifierCode: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },

  // Optional: Kit-level tracking
  kitNumber: { type: String },

  // Custom fields (including multilingual)
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Languages this label supports (e.g., ['en', 'fr', 'es'])
  languages: {
    type: [String],
    default: ["en"],
  },

  // Optional: language metadata
  // languages: {
  //   en: { status: 'complete', translatedBy: '...', translatedAt: Date },
  //   ...
  // }

  metadata: {
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
});

// Single‐field index for identifierCode lookups
LabelSchema.index({ identifierCode: 1 }, { unique: true });

// Compound index for sponsor + trial + batch lookups
LabelSchema.index({ sponsorName: 1, trialIdentifier: 1, batchNumber: 1 });

// Compound index for sponsor + trial + kit lookups
LabelSchema.index({ sponsorName: 1, trialIdentifier: 1, kitNumber: 1 });

module.exports = mongoose.model("Label", LabelSchema);
