const express = require("express");
const connectDB = require("./config/db");
const otpRoutes = require("./routes/otpRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
