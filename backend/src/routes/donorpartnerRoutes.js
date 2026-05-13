const express = require("express");
const router = express.Router();

const donorPartnerController = require("../controllers/donorPartnerController");

router.post("/register", donorPartnerController.registerDonorPartner);
router.put("/update/:id", donorPartnerController.updateDonorPartner);
router.delete("/delete/:id", donorPartnerController.deleteDonorPartner);
router.get("/summary", donorPartnerController.getDonorPartnerSummary);

module.exports = router;