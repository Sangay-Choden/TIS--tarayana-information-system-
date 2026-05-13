const express = require("express");
const multer = require("multer");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const upload = require("../middleware/upload");

router.post(
  "/upload",
  upload.single("image"), 
  bannerController.uploadBanner
);
router.get("/", bannerController.getBanner);

module.exports = router;