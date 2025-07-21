const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price must be positive"],
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  variations: [
    {
      color: { type: String },
      size: { type: String },
      img: { type: String },
      stock: {
        type: Number,
        default: 0,
        min: [0, "Stock cannot be negative"],
      },
      price: {
        type: Number,
        min: [0, "Price must be positive"],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
