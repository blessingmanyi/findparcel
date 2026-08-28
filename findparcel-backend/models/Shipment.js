const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    // =========================
    // CUSTOMER WHO CREATED SHIPMENT
    // =========================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // TRACKING NUMBER
    // =========================
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =========================
    // SENDER
    // =========================
    sender: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // SENDER ID NUMBER
      // =========================
      idNumber: {
        type: String,
        required: [
          true,
          "Sender ID number is required",
        ],
        trim: true,
        minlength: [
          5,
          "Sender ID number is too short",
        ],
        match: [
          /^[A-Za-z0-9][A-Za-z0-9 -]*$/,
          "Sender ID number contains invalid characters",
        ],
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // =========================
    // RECEIVER
    // =========================
    receiver: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
      },

      // =========================
      // RECEIVER ID NUMBER
      // =========================
      idNumber: {
        type: String,
        required: [
          true,
          "Receiver ID number is required",
        ],
        trim: true,
        minlength: [
          5,
          "Receiver ID number is too short",
        ],
        match: [
          /^[A-Za-z0-9][A-Za-z0-9 -]*$/,
          "Receiver ID number contains invalid characters",
        ],
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // =========================
    // PACKAGE INFORMATION
    // =========================
    packageInfo: {
      type: {
        type: String,
        required: true,
      },

      weight: {
        type: Number,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },
    },

    // =========================
    // DELIVERY SPEED
    // =========================
    deliverySpeed: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },

    // =========================
    // SHIPMENT STATUS
    // =========================
    status: {
      type: String,
      enum: [
        "Pending",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
    },

    // =========================
    // PROGRESS
    // =========================
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // =========================
    // SHIPPING PRICE
    // =========================
    shippingPrice: {
      type: Number,
      required: true,
    },

    // =========================
    // ESTIMATED DELIVERY
    // =========================
    estimatedDelivery: {
      type: Date,
      required: true,
    },

    // =========================
    // TRACKING TIMELINE
    // =========================
    timeline: [
      {
        title: String,
        location: String,
        date: String,
        time: String,

        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Shipment = mongoose.model(
  "Shipment",
  shipmentSchema
);

module.exports = Shipment;