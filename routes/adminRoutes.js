const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  deleteUser,
  updateAdminProfile,
} = require("../controllers/adminController");
const activityLogSchema = require("../models/activityLog ");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.get(
  "/dashboard-stats",
  protect,
  checkRole(["admin"]),
  getDashboardStats
);

router.get(
  "/activity-logs",
  protect,
  checkRole(["admin"]),
  async (req, res) => {
    const logs = await activityLogSchema.find().sort({ createdAt: -1 });
    res.json(logs);
  }
);

router.put("/profile", protect, checkRole(["admin"]), updateAdminProfile);

router.delete("/user/:id", protect, checkRole(["admin"]), deleteUser);

module.exports = router;
