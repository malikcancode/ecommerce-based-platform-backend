const Product = require("../models/productModel");
const logActivity = require("../utils/logActivity");
const Inventory = require("../models/inventoryModel");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      salePrice,
      category,
      stock,
      color,
      sizes,
      tags,
    } = req.body;

    const user = req.user;
    let variations = req.body.variations;

    if (
      !name ||
      !description ||
      !originalPrice ||
      !category ||
      !color ||
      !sizes
    ) {
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

    let parsedTags = tags;
    if (typeof parsedTags === "string") {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }

    let image = null;
    if (req.files && req.files.image && req.files.image[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.variationImages) {
      req.files.variationImages.forEach((file, idx) => {
        if (variations[idx]) {
          variations[idx].image = `/uploads/${file.filename}`;
        }
      });
    }

    let discount = 0;
    if (salePrice && salePrice < originalPrice) {
      discount = Math.round(
        ((originalPrice - salePrice) / originalPrice) * 100
      );
    }

    const product = await Product.create({
      name,
      description,
      originalPrice,
      salePrice,
      discount,
      category,
      stock,
      color,
      sizes: parsedSizes,
      tags: parsedTags || [],
      variations,
      image,
      createdBy: req.user?.id,
    });

    await Inventory.create({
      productId: product._id,
      quantityAvailable: stock || 0,
      warehouseLocation: "Default Warehouse",
    });

    const performedBy = user?.email || "Unknown User";

    await logActivity(
      "PRODUCT_CREATED",
      performedBy,
      `Product "${name}" created in ${category}`
    );

    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      salePrice,
      category,
      stock,
      color,
      sizes,
      tags,
      variations,
    } = req.body;

    const updatedData = {
      name,
      description,
      originalPrice,
      salePrice,
      category,
      stock,
      color,
    };

    if (originalPrice && salePrice && originalPrice > salePrice) {
      updatedData.discount = Math.round(
        ((originalPrice - salePrice) / originalPrice) * 100
      );
    } else {
      updatedData.discount = 0;
    }

    if (sizes && typeof sizes === "string") {
      try {
        updatedData.sizes = JSON.parse(sizes);
      } catch (e) {
        return res.status(400).json({ message: "Invalid sizes format" });
      }
    } else if (sizes) {
      updatedData.sizes = sizes;
    }

    if (tags && typeof tags === "string") {
      try {
        updatedData.tags = JSON.parse(tags);
      } catch (e) {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    } else if (tags) {
      updatedData.tags = tags;
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

exports.getProducts = async (req, res) => {
  try {
    const { search, category, tags, size, page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All Products") query.category = category;
    if (tags) {
      const tagList = tags.split(",");
      query.tags = { $in: tagList };
    }
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

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
