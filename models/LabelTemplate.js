// models/LabelTemplate.js

const mongoose = require("mongoose");

const FieldDefinitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["String", "Text", "List", "Date"],
      required: true,
    },
    label: { type: String, required: true },
    translatable: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const LabelTemplateSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  description: { type: String },
  version: { type: Number, required: true },
  requiredFields: [FieldDefinitionSchema],
  customFields: [FieldDefinitionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LabelTemplate", LabelTemplateSchema);
