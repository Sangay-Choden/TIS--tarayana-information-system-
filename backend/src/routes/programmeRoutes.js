const express = require("express");
const router = express.Router();
const programmeController = require("../controllers/programmeController");
const { isAdmin } = require("../middleware/isAdmin");
// Create a new programme
router.post("/", isAdmin, programmeController.createProgramme);
router.get("/", programmeController.getAllProgrammes);
router.get("/:id", programmeController.getProgrammeById);
router.put("/:id", isAdmin, programmeController.updateProgramme);
router.delete("/:id", isAdmin, programmeController.deleteProgramme);

module.exports = router;