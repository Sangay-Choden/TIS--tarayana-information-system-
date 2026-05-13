const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: [true, "Project Name is required"] },
  programmeOfficer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  dzongkhag: { 
    type: [String], 
    validate: [v => v.length > 0, "At least one Dzongkhag must be selected"] 
  },
  startDate: { type: Date, required: [true, "Start Date is required"] },
  endDate: { type: Date, required: [true, "End Date is required"] },
  donor: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "donorPartner", 
    default: []
  },
  partner: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "donorPartner", 
    default: []
  },
  programme: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "Programme", 
    required: [true, "At least one Programme must be selected"] 
  },
  fieldOfficer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Ongoing', 'Completed', 'Inactive'], 
    default: 'Ongoing'
  },


  realQuantity: { type: Number, default: 0 },
  // Add this to your projectSchema in projectModel.js
  keyActivityVerification: [{
    activityName: String,
    realQuantity: { type: Number, default: 0 },
    isConfirmed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);