const express = require("express");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/admin", protect, checkRole(["admin"]), (req, res) => {
  res.json({ message: "Hello Admin!" });
});

router.get("/buyer", protect, checkRole(["buyer"]), (req, res) => {
  res.json({ message: "Hello buyer!" });
});

module.exports = router;
