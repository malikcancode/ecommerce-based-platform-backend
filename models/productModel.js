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

  image: String,

  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price must be positive"],
  },

  tags: {
    type: [String],
    enum: ["sale", "new", "featured", "latest"],
    default: [],
  },

  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: {
      values: [
        "All Products",
        "Shirts",
        "Pants",
        "Dresses",
        "Jackets",
        "Shoes",
        "New Arrivals",
        "Sale",
      ],
      message: "{VALUE} is not a valid category",
    },
  },
  color: {
    type: String,
    required: [true, "Product color is required"],
  },
  sizes: [
    {
      type: String,
      enum: {
        values: ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32"],
        message: "{VALUE} is not a valid size",
      },
    },
  ],
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  variations: [
    {
      name: { type: String },
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productSchema);
