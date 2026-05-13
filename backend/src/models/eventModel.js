const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    annualEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnnualEvent",
      required: true
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed // flexible values
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);