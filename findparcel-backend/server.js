require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const shipmentRoutes = require("./routes/shipmentRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const addressRoutes = require("./routes/addressRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FindParcel backend is running",
  });
});

// Shipment routes
app.use("/api/shipments", shipmentRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api/addresses",
  addressRoutes
);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/payments",
  paymentRoutes
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});