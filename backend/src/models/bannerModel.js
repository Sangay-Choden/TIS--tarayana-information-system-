const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  imageUrl: String,
  publicId: String,
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);