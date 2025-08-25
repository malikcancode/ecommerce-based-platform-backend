const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Price must be a positive number"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    color: {
      type: String,
      required: true,
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price must be a positive number"],
    },
    discount: {
      type: Number,
      min: [0, "Discount can't be negative"],
      max: [100, "Discount can't exceed 100%"],
    },
    category: {
      type: String,
      enum: ["All Products", "Shirts", "Pants", "Dresses", "Jackets", "Shoes"],
      required: [true, "Category is required"],
    },
    sizes: {
      type: [String],
      enum: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "28",
        "30",
        "32",
        "34",
        "36",
        "38",
        "40",
        "5",
        "5.5",
        "6",
        "6.5",
        "7",
        "7.5",
        "8",
        "8.5",
        "9",
        "9.5",
        "10",
        "10.5",
        "11",
        "11.5",
        "12",
      ],
      required: [true, "At least one size is required"],
    },
    tags: {
      type: [String],
      enum: ["Sale", "Featured", "New Arrivals", "Discount"],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    image: {
      type: String,
      default: "",
    },
    variations: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          min: 0,
        },
        stock: {
          type: Number,
          default: 0,
        },
        color: String,
        image: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
