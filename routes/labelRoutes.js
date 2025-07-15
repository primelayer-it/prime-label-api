const express = require("express");
const {
  getLabels,
  getLabelById,
  getLabelByBatchNumber,
  getLabelByProtocolAndKit,
  getLabelByIdentifier,
  getLabelBySponsorTrialBatch,
  getLabelBySponsorTrialKit,
} = require("../controllers/labelController");

const router = express.Router();

// Dedicated lookup endpoints
router.get("/identifier/:identifierCode", getLabelByIdentifier);
router.get(
  "/:sponsorName/:trialIdentifier/batch/:batchNumber",
  getLabelBySponsorTrialBatch
);
router.get(
  "/:sponsorName/:trialIdentifier/kit/:kitNumber",
  getLabelBySponsorTrialKit
);

// Generic endpoints
router.get("/", getLabels);
router.get("/:id", getLabelById);
router.get("/batch/:batchNumber", getLabelByBatchNumber);
router.get(
  "/protocol/:protocolNumber/kit/:kitNumber",
  getLabelByProtocolAndKit
);

module.exports = router;
