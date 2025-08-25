const Order = require("../models/ordersModel");
const userModel = require("../models/userModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const activeUsers = await User.countDocuments({ isEmailVerified: true });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    res.json({
      totalSales,
      activeUsers,
      todayOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  const { name, password } = req.body;
  const adminId = req.user.id;

  try {
    const admin = await userModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (password) admin.password = await bcrypt.hash(password, 10);

    await admin.save();
    res.json({ message: "Profile updated successfully", name: admin.name });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
