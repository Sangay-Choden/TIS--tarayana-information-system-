const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, entity, entityId = null, details = "", userName = "System") => {
  try {
    const logData = {
      action,
      entity,
      entityId,
      details,
      userName
    };

    // Only add the user field if we actually have a valid ID
    if (userId) {
      logData.user = userId;
    }

    await ActivityLog.create(logData);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

module.exports = logActivity;