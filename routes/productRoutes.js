const express = require("express");
const router = express.Router();

const { protect, checkRole } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/create", protect, checkRole(["admin", "seller"]), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, checkRole(["admin", "seller"]), updateProduct);
router.delete("/:id", protect, checkRole(["admin", "seller"]), deleteProduct);

module.exports = router;
