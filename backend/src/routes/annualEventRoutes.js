const express = require("express");
const router = express.Router();

const annualEventController = require("../controllers/annualEventController");

router.post("/main-event", annualEventController.createAnnualEvent);
router.post("/event", annualEventController.createEvent);
router.get("/",annualEventController.getAllAnnualEvents);
router.get("/main-event/:id", annualEventController.getEventById);
router.put("/main-event/:id", annualEventController.updateAnnualEvent);
router.delete("/main-event/:id", annualEventController.deleteAnnualEvent);


router.get("/events/:annualEventId",annualEventController.getEventsByAnnualEvent);

router.put("/event/:id",annualEventController.updateEvent);
router.delete("/event/:id",annualEventController.deleteEvent);

module.exports = router;