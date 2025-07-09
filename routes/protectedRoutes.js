const express = require("express");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/admin", protect, checkRole(["admin"]), (req, res) => {
  res.json({ message: "Hello Admin!" });
});

router.get("/seller", protect, checkRole(["seller"]), (req, res) => {
  res.json({ message: "Hello seller!" });
});

router.get("/buyer", protect, checkRole(["buyer"]), (req, res) => {
  res.json({ message: "Hello buyer!" });
});

router.get("/manager", protect, checkRole(["manager"]), (req, res) => {
  res.json({ message: "Hello manager!" });
});

module.exports = router;
