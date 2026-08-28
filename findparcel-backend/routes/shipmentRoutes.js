
const express = require("express");

const {
  createShipment,
  getShipments,
  getCustomerShipments,
  getShipmentByTrackingNumber,
  updateShipmentStatus,
} = require("../controllers/shipmentController");

const router = express.Router();


// =========================
// CREATE SHIPMENT
// =========================
router.post(
  "/",
  createShipment
);


// =========================
// GET ALL SHIPMENTS
// =========================
router.get(
  "/",
  getShipments
);


// =========================
// GET CUSTOMER SHIPMENTS
// IMPORTANT:
// This MUST come before /:trackingNumber
// =========================
router.get(
  "/customer/:customerId",
  getCustomerShipments
);


// =========================
// UPDATE SHIPMENT STATUS
// =========================
router.patch(
  "/:trackingNumber/status",
  updateShipmentStatus
);


// =========================
// GET SHIPMENT BY TRACKING NUMBER
// =========================
router.get(
  "/:trackingNumber",
  getShipmentByTrackingNumber
);


module.exports = router;

