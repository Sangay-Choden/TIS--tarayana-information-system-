const mongoose = require("mongoose");

const beneficiarySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  year: { type: Number, required: true },
  gender: { 
    type: String, 
    enum: { values: ['M', 'F'], message: '{VALUE} is not supported' }, 
    required: true 
  },
  cid: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) { return /^\d{11}$/.test(v); },
      message: props => `${props.value} is not a valid 11-digit CID!`
    }
  },
  name: { type: String, required: true },
  dzongkhag: { type: String, required: true, lowercase: true }, // Logic handled in controller
  gewog: { type: String, required: true, lowercase: true },
  village: { type: String, required: true, lowercase: true },
  houseNo: { type: String, required: true },
  thramNo: { type: String, required: true },
  indirectBeneficiaries: {
    male: { type: Number, default: 0 },
    female: { type: Number, default: 0 }
  },
  keyActivities: [{
    // Remove 'required: true' from these to allow training-only entries
    activityName: { type: String, lowercase: true }, 
    totalQuantity: { type: Number },
    unit: { type: String, enum: ['Acres', 'Litres', 'Nos', 'Meters'] },
    specifications: {
    type: [Number],
    default: [], // Ensures it starts as an empty array rather than null
    validate: {
      validator: function(arr) {
        // If the array is empty or doesn't exist, it's valid
        if (!arr || arr.length === 0) return true;
        
        // Otherwise, ensure every item is a number
        return arr.every(n => typeof n === 'number' && !isNaN(n));
      },
      message: 'Specifications must be numbers'
    }
  },
    isTraining: { type: Boolean, default: false },
    // FIXED: Changed from String to an Object structure
    trainingDetails: {
      date: { type: Date },
      type: { type: String, lowercase: true }
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Beneficiary", beneficiarySchema);