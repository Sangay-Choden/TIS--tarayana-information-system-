const mongoose = require("mongoose");

const programmeSchema = new mongoose.Schema({
  programmeName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  programmeDescription: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Programme", programmeSchema);