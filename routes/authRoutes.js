const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  requestReset,
  resetPassword,
  getAllUsers,
} = require("../controllers/otpController");
const { protect, checkRole } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-reset", requestReset);
router.post("/reset-password", resetPassword);
router.get("/users", protect, checkRole(["admin"]), getAllUsers);

module.exports = router;
