const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // user is now optional (required: false)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  // userName acts as a fallback for the display
  userName: { type: String, default: 'System' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);