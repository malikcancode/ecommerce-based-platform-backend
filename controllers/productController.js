const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, variations } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      variations,
      createdBy: req.user ? req.user.id : undefined,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, variations } = req.body;

    const updatedData = {
      name,
      description,
      price,
      category,
      stock,
    };

    if (variations) {
      updatedData.variations = variations;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
