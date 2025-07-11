const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  deleteUser,
} = require("../controllers/otpController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/user/:id", protect, checkRole(["admin"]), deleteUser);

module.exports = router;
