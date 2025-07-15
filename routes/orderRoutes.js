const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/createOrder", protect, checkRole(["buyer"]), createOrder);

router.get("/getOrders", protect, getOrders);

router.get("/:id", protect, getOrderById);

router.put(
  "/:id/status",
  protect,
  checkRole(["admin", "seller"]),
  updateOrderStatus
);

router.delete("/:id", protect, checkRole(["admin", "buyer"]), deleteOrder);

module.exports = router;
