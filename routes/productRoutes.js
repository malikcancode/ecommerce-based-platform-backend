const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { protect, checkRole } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post(
  "/create",
  protect,
  checkRole(["admin", "seller"]),
  upload.fields([{ name: "image", maxCount: 1 }]),
  createProduct
);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  protect,
  checkRole(["admin", "seller"]),
  upload.single("image"),
  updateProduct
);
router.delete("/:id", protect, checkRole(["admin", "seller"]), deleteProduct);

module.exports = router;
