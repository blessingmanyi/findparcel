
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const shipmentRoutes = require("./routes/shipmentRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const addressRoutes = require("./routes/addressRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// =====================================================
// CONNECT TO MONGODB
// =====================================================

connectDB();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://findparcel-omega.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      // that do not send an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,

    optionsSuccessStatus: 204,
  })
);

// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "FindParcel backend is running",
  });
});

// =====================================================
// SHIPMENT ROUTES
// =====================================================

app.use(
  "/api/shipments",
  shipmentRoutes
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// ADDRESS ROUTES
// =====================================================

app.use(
  "/api/addresses",
  addressRoutes
);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use(
  "/api/payments",
  paymentRoutes
);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `FindParcel backend running on port ${PORT}`
  );
});

