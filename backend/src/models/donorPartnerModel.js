// models/DonorPartner.js

const mongoose = require("mongoose");

const donorPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("donorPartner", donorPartnerSchema);