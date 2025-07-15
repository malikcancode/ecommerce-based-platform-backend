const productModel = require("../models/productModel");
const ordersModel = require("../models/ordersModel");

exports.createOrder = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only buyers can create orders!" });
    }
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required!" });
    }
    let totalAmount = 0;
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res
          .status(400)
          .json({ message: "Invalid product or quantity!" });
      }
      const product = await productModel.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }
      totalAmount += product.price * item.quantity;
    }
    const order = await ordersModel.create({
      buyer: req.user.id,
      items,
      totalAmount,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await ordersModel
      .findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "name price");
    if (!order) return res.status(404).json({ message: "Order not found!" });
    if (
      req.user.role === "buyer" &&
      order.buyer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied!" });
    }
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "buyer") {
      filter.buyer = req.user.id;
    }
    const orders = await ordersModel
      .find(filter)
      .populate("buyer", "name email")
      .populate("items.product", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (!["admin", "seller"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Only admin or seller can update status" });
    }
    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status!" });
    }
    const order = await ordersModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found!" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await ordersModel.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found!" });
    if (req.user.role === "buyer" && order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied!" });
    }
    if (req.user.role !== "admin" && req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only admin or buyer can delete!" });
    }
    await order.deleteOne();
    res.json({ message: "Order deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
