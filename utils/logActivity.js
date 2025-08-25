const ActivityLog = require("../models/activityLog ");

const logActivity = async (actionType, performedBy, details) => {
  try {
    await ActivityLog.create({
      actionType,
      performedBy,
      details,
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

module.exports = logActivity;
