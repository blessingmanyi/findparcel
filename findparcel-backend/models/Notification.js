const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =========================
    // CUSTOMER WHO RECEIVES
    // =========================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // NOTIFICATION TITLE
    // =========================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // NOTIFICATION MESSAGE
    // =========================
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // NOTIFICATION TYPE
    // =========================
    type: {
      type: String,
      enum: [
        "shipment_created",
        "shipment_status",
        "general",
      ],
      default: "general",
    },

    // =========================
    // RELATED SHIPMENT
    // =========================
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },

    // =========================
    // TRACKING NUMBER
    // =========================
    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // READ / UNREAD
    // =========================
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;