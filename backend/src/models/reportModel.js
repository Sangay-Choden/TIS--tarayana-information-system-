const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: String,
  type: String, // quarterly / annual
  year: Number,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },

  // optional filters (useful later)
  programmes: [String],
  projects: [String],
  officers: [String],
});

module.exports = mongoose.model("Report", reportSchema);