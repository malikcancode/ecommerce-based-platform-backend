const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, color, sizes, tags } =
      req.body;
    let variations = req.body.variations;

    if (!name || !description || !price || !category || !color || !sizes) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (variations && typeof variations === "string") {
      try {
        variations = JSON.parse(variations);
      } catch (e) {
        return res.status(400).json({ message: "Invalid variations format" });
      }
    }

    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        return res.status(400).json({ message: "Invalid sizes format" });
      }
    }

    let parsedTags = req.body.tags;

    if (typeof parsedTags === "string") {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }

    const image = req.files?.image?.[0]
      ? `/uploads/${req.files.image[0].filename}`
      : null;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      color,
      tags: parsedTags || [],
      sizes: parsedSizes,
      variations,
      image,
      createdBy: req.user ? req.user.id : undefined,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { search, category, tag, size, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All Products") query.category = category;
    if (tag) query.tags = tag;
    if (size) query.sizes = size;

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
    const {
      name,
      description,
      price,
      category,
      stock,
      color,
      sizes,
      variations,
    } = req.body;

    let updatedData = {
      name,
      description,
      price,
      category,
      stock,
      color,
    };

    if (sizes && typeof sizes === "string") {
      try {
        updatedData.sizes = JSON.parse(sizes);
      } catch (e) {
        return res.status(400).json({ message: "Invalid sizes format" });
      }
    } else if (sizes) {
      updatedData.sizes = sizes;
    }

    if (variations && typeof variations === "string") {
      try {
        updatedData.variations = JSON.parse(variations);
      } catch (e) {
        return res.status(400).json({ message: "Invalid variations format" });
      }
    } else if (variations) {
      updatedData.variations = variations;
    }

    if (req.files?.image?.[0]) {
      updatedData.image = `/uploads/${req.files.image[0].filename}`;
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
