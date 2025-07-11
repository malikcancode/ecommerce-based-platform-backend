const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
  },
  lastRestockedDate: {
    type: Date,
    default: Date.now,
  },
  warehouseLocation: String,
  minimumStockAlert: {
    type: Number,
    min: [0, "Minimum stock alert must be positive"],
  },
});

module.exports = mongoose.model("Inventory", inventorySchema);
