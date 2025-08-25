const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.get("/getAllInventory", inventoryController.getAllInventory);
router.get("/:id", inventoryController.getInventoryById);

router.post(
  "/createInventory",
  protect,
  checkRole(["admin"]),
  inventoryController.createInventory
);

router.put(
  "/:id",
  protect,
  checkRole(["admin"]),
  inventoryController.updateInventory
);

router.delete(
  "/:id",
  protect,
  checkRole(["admin"]),
  inventoryController.deleteInventory
);

router.post(
  "/reduce",
  protect,
  checkRole(["admin"]),
  inventoryController.reduceInventoryStock
);

module.exports = router;
