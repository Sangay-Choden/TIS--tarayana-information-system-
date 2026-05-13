
const Event = require("../models/eventModel");
const AnnualEvent = require("../models/annualEventModel");

exports.createAnnualEvent = async (req, res) => {
  try {
     console.log("REQ BODY:", req.body);
    const { eventName, fields } = req.body;

    if (!eventName) {
      return res.status(400).json({ message: "Event name is required" });
    }

    const event = await AnnualEvent.create({
      eventName,
      fields
    });

    res.json({
      message: "Annual event created successfully",
      data: event
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await AnnualEvent.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      data: event
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateAnnualEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, fields } = req.body;

    const updated = await AnnualEvent.findByIdAndUpdate(
      id,
      { eventName, fields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Annual event not found" });
    }

    res.json({
      message: "Annual event updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAnnualEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AnnualEvent.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Annual event not found" });
    }

    // delete all child events
    await Event.deleteMany({ annualEventId: id });

    res.json({
      message: "Annual event and its events deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllAnnualEvents = async (req, res) => {
  try {
    const events = await AnnualEvent.find();
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventsByAnnualEvent = async (req, res) => {
  try {
    const { annualEventId } = req.params;

    const events = await Event.find({ annualEventId });

    res.json({
      total: events.length,
      data: events
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.createEvent = async (req, res) => {
  try {
    const { annualEventId, data } = req.body;

    const template = await AnnualEvent.findById(annualEventId);
    if (!template) {
      return res.status(404).json({ message: "Annual event not found" });
    }

    // Validate fields
    for (let field of template.fields) {
      const value = data[field.fieldName];

      // Required check
      if (field.required && (value === undefined || value === null)) {
        return res.status(400).json({
          message: `${field.fieldName} is required`
        });
      }

      // Type validation
      if (value !== undefined) {
        switch (field.fieldType) {
          case "number":
            if (typeof value !== "number") {
              return res.status(400).json({
                message: `${field.fieldName} must be a number`
              });
            }
            break;

          case "text":
            if (typeof value !== "string") {
              return res.status(400).json({
                message: `${field.fieldName} must be text`
              });
            }
            break;

          case "boolean":
            if (typeof value !== "boolean") {
              return res.status(400).json({
                message: `${field.fieldName} must be boolean`
              });
            }
            break;

          case "date":
            if (isNaN(Date.parse(value))) {
              return res.status(400).json({
                message: `${field.fieldName} must be a valid date`
              });
            }
            break;
        }
      }
    }

    const event = await Event.create({
      annualEventId,
      data
    });

    res.json({
      message: "Event created successfully",
      data: event
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const updated = await Event.findByIdAndUpdate(
      id,
      { data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

