const productModel = require("../models/productModel");
const ordersModel = require("../models/ordersModel");
const { default: mongoose } = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const logActivity = require("../utils/logActivity");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only buyers can create orders!" });
    }

    const { items, shippingPrice } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required!" });
    }

    let totalAmount = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1 || !item.size) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "Invalid product, quantity, or size!" });
      }

      const product = await productModel
        .findById(item.product)
        .session(session);

      if (!product) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      const inventory = await inventoryModel
        .findOne({ productId: item.product })
        .session(session);
      if (!inventory || inventory.quantityAvailable < item.quantity) {
        await session.abortTransaction();
        return res
          .status(401)
          .json({ message: `Not enough stock for product: ${product.name}` });
      }

      const productPrice = product.salePrice ?? product.originalPrice;
      if (typeof productPrice !== "number" || isNaN(productPrice)) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: `Invalid price for product: ${product.name}` });
      }

      // Reduce inventory stock
      inventory.quantityAvailable -= item.quantity;
      await inventory.save({ session });

      // Reduce product stock (main product)
      product.stock = Math.max(0, (product.stock || 0) - item.quantity);

      // If variationId is present, reduce variation stock
      if (item.variationId) {
        const variationIdx = product.variations.findIndex(
          (v) => v._id?.toString() === item.variationId?.toString()
        );
        if (variationIdx !== -1) {
          product.variations[variationIdx].stock = Math.max(
            0,
            (product.variations[variationIdx].stock || 0) - item.quantity
          );
        }
      }

      await product.save({ session });

      totalAmount += productPrice * item.quantity;
    }

    totalAmount += shippingPrice;

    const order = await ordersModel.create(
      [
        {
          buyer: req.user.id,
          items,
          shippingPrice,
          totalAmount,
        },
      ],
      { session }
    );

    const performedBy = req.user?.email || "Unknown User";
    await logActivity(
      "ORDER_CREATED",
      performedBy,
      `Order placed by ${performedBy} for amount $${totalAmount}`
    );

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await ordersModel
      .findById(req.params.id)
      .populate("buyer", "name email")
      .populate({
        path: "items.product",
        // Populate all fields including variations
        select: "-__v",
      });
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
      .populate({
        path: "items.product",
        select: "-__v",
      });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
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

  const order = await ordersModel.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found!" });

  // Only admin can update any status
  if (req.user.role === "admin") {
    // If marking as delivered, reduce stock
    if (status === "delivered" && order.status !== "delivered") {
      for (const item of order.items) {
        // ...existing reduce logic...
      }
    }
    // If marking as cancelled, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await productModel.findById(item.product);
        if (product) {
          // Restore product stock
          product.stock = (product.stock || 0) + item.quantity;

          // Restore variation stock if applicable
          if (item.variationId) {
            const variationIdx = product.variations.findIndex(
              (v) => v._id?.toString() === item.variationId?.toString()
            );
            if (variationIdx !== -1) {
              product.variations[variationIdx].stock =
                (product.variations[variationIdx].stock || 0) + item.quantity;
            }
          }
          await product.save();

          // Restore inventory stock
          const inventory = await inventoryModel.findOne({
            productId: item.product,
          });
          if (inventory) {
            inventory.quantityAvailable =
              (inventory.quantityAvailable || 0) + item.quantity;
            await inventory.save();
          }
        }
      }
    }
    order.status = status;
    await order.save();
    return res.json(order);
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

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await ordersModel
      .find({ buyer: req.user.id })
      .populate("items.product", "name price")
      .sort({ createdAat: -1 });
    res.status(200).json({
      message: "Order history fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while getting orders" });
  }
};
