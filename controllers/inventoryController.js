const inventoryModel = require("../models/inventoryModel");

exports.createInventory = async (req, res) => {
  try {
    const {
      productId,
      quantityAvailable,
      lastRestockedDate,
      warehouseLocation,
      minimumStockAlert,
    } = req.body;

    if (!productId || !quantityAvailable) {
      return res
        .status(400)
        .json({ message: "productId and quantityAvailable are required" });
    }

    const inventory = await inventoryModel.create({
      productId,
      quantityAvailable,
      lastRestockedDate,
      warehouseLocation,
      minimumStockAlert,
    });
    res
      .status(201)
      .json({ message: "Inventory created successfully", inventory });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating inventory",
      error: error.message,
    });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const inventoryList = await inventoryModel.find().populate("productId");
    res.status(200).json(inventoryList);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching inventory",
      error: error.message,
    });
  }
};

exports.getInventoryById = async (req, res) => {
  const { id } = req.params;
  const inventoryItem = await inventoryModel.findById(id).populate("productId");
  if (!inventoryItem) {
    return res.status(404).json({ message: "Inventory item not found" });
  }
  res.status(200).json(inventoryItem);
};

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productId,
      quantityAvailable,
      lastRestockedDate,
      warehouseLocation,
      minimumStockAlert,
    } = req.body;

    const updatedInventory = await inventoryModel.findByIdAndUpdate(
      id,
      {
        productId,
        quantityAvailable,
        lastRestockedDate,
        warehouseLocation,
        minimumStockAlert,
      },
      { new: true }
    );
    if (!updatedInventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res
      .status(200)
      .json({ message: "Inventory updated successfully", updatedInventory });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating inventory",
      error: error.message,
    });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInventory = await inventoryModel.findByIdAndDelete(id);

    if (!deletedInventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(201).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting Inventory",
      error: error.message,
    });
  }
};

exports.reduceInventoryStock = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    if (!productId || !quantitySold) {
      return res
        .status(400)
        .json({ message: "productId and quantitySold are required" });
    }

    const inventory = await inventoryModel.findOne({ productId });
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Inventory record not found for this product" });
    }

    if (inventory.quantityAvailable < quantitySold) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${inventory.quantityAvailable}, Requested: ${quantitySold}`,
      });
    }

    inventory.quantityAvailable -= quantitySold;
    await inventory.save();

    res.status(200).json({
      message: "Inventory stock reduced successfully",
      inventory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating inventory",
      error: error.message,
    });
  }
};
