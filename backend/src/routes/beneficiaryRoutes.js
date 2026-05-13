const express = require("express");
const router = express.Router();
const beneficiaryController = require("../controllers/beneficiaryController");
const { protect } = require("../middleware/authMiddleware");


// Path: /api/beneficiaries
router.post("/", protect, beneficiaryController.createBeneficiary);
router.get("/", protect, beneficiaryController.getAllBeneficiaries);
router.get("/dzongkhag", beneficiaryController.getAllBeneficiariesbyDzongkhag);

router.get("/bene/:projectId", protect, beneficiaryController.getProjectBeneficiaries);
router.put("/:id", protect, beneficiaryController.updateBeneficiary);


router.delete("/:id", protect, beneficiaryController.deleteBeneficiary);
router.get("/:id", protect, beneficiaryController.getBeneficiaryById);
router.get("/programme/:programmeId",beneficiaryController.getProgrammeBeneficiaries);

module.exports = router;