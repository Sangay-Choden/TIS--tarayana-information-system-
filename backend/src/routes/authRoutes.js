const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog")
const authController = require("../controllers/authController");
const { isAdmin } = require("../middleware/isAdmin");


router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.put("/update/:id", authController.updateUser);
router.put("/change-password/:id", authController.changePassword);
router.get("/users", authController.getAllUsers);
router.get("/user/:id", authController.getUserById);
router.get("/users/count", authController.getUserStats);
router.delete("/user/:id",isAdmin, authController.deleteUser);

router.get("/programme-officers", authController.getAllProgrammeOfficers);
router.get("/feild-officers", authController.getAllFieldOfficers);
router.get('/recent-activity', async (req, res) => {
  try {
    // 1. Check if the model exists and find logs
    const logs = await ActivityLog.find()
      .populate('user', 'name email') // This pulls name/email from the User collection
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(); // .lean() makes the query faster and easier to handle

    // 2. Return an empty array instead of an error if no logs exist
    res.status(200).json(logs || []);
    
  } catch (err) {
    console.error("DETAILED LOG ERROR:", err); // This shows the REAL error in your terminal
    res.status(500).json({ 
      error: "Could not fetch logs", 
      message: err.message 
    });
  }
});

module.exports = router;



