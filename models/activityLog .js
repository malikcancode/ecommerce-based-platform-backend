const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
