const Shipment = require("../models/Shipment");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
  sendShipmentCreatedEmail,
} = require("../utils/emailService");

// =====================================================
// CREATE A NEW SHIPMENT
// =====================================================
const createShipment = async (req, res) => {
  try {
    const { customerId } = req.body;

    // ---------------------------------------------
    // CHECK CUSTOMER ID
    // ---------------------------------------------
    if (!customerId) {
      return res.status(400).json({
        message: "Customer information is required.",
      });
    }

    // ---------------------------------------------
    // CHECK CUSTOMER EXISTS
    // ---------------------------------------------
    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    // ---------------------------------------------
    // GENERATE TRACKING NUMBER
    // ---------------------------------------------
    const trackingNumber =
      "FP" +
      Math.floor(
        100000000 + Math.random() * 900000000
      );

    // ---------------------------------------------
    // CALCULATE ESTIMATED DELIVERY
    // ---------------------------------------------
    const estimatedDelivery = new Date();

    if (req.body.deliverySpeed === "express") {
      // Express = 2 days
      estimatedDelivery.setDate(
        estimatedDelivery.getDate() + 2
      );
    } else {
      // Standard = 4 days
      estimatedDelivery.setDate(
        estimatedDelivery.getDate() + 4
      );
    }

    // ---------------------------------------------
    // FORMATTED DELIVERY DATE
    // Used for timeline display
    // ---------------------------------------------
    const formattedDeliveryDate =
      estimatedDelivery.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

    // ---------------------------------------------
    // CURRENT DATE AND TIME
    // ---------------------------------------------
    const now = new Date();

    const currentDate =
      now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const currentTime =
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    // ---------------------------------------------
    // CREATE SHIPMENT
    // ---------------------------------------------
    const shipment = new Shipment({
      customerId: customer._id,

      trackingNumber,

      sender: req.body.sender,

      receiver: req.body.receiver,

      packageInfo: {
        type: req.body.packageInfo.type,

        weight: Number(
          req.body.packageInfo.weight
        ),

        description:
          req.body.packageInfo.description,
      },

      deliverySpeed:
        req.body.deliverySpeed || "standard",

      status: "Pending",

      progress: 0,

      shippingPrice: Number(
        req.body.shippingPrice
      ),

      // IMPORTANT:
      // Save actual Date object
      estimatedDelivery,

      // -----------------------------------------
      // TRACKING TIMELINE
      // -----------------------------------------
      timeline: [
        {
          title: "Shipment Created",

          location:
            req.body.sender.city,

          date: currentDate,

          time: currentTime,

          completed: true,
        },

        {
          title: "Awaiting Pickup",

          location:
            req.body.sender.city,

          date: currentDate,

          time: "",

          completed: false,
        },

        {
          title: "In Transit",

          location: "On the way",

          date:
            formattedDeliveryDate,

          time: "",

          completed: false,
        },

        {
          title: "Out for Delivery",

          location:
            req.body.receiver.city,

          date:
            formattedDeliveryDate,

          time: "",

          completed: false,
        },

        {
          title: "Delivered",

          location:
            req.body.receiver.city,

          date:
            formattedDeliveryDate,

          time: "",

          completed: false,
        },
      ],
    });

    // ---------------------------------------------
    // SAVE SHIPMENT
    // ---------------------------------------------
    const savedShipment =
      await shipment.save();

    // =================================================
    // SEND EMAIL TO RECEIVER
    // =================================================
    try {
      await sendShipmentCreatedEmail(
        savedShipment
      );

      console.log(
        `Receiver shipment email sent to ${savedShipment.receiver.email}`
      );
    } catch (emailError) {
      // Do NOT delete the shipment if email fails.
      // The shipment has already been successfully
      // created and saved in MongoDB.

      console.error(
        "Receiver shipment email error:",
        emailError.message
      );
    }

    // =================================================
    // CHECK IF RECEIVER HAS A FINDPARCEL ACCOUNT
    // =================================================

    const receiverEmail =
      savedShipment.receiver.email
        ?.trim()
        .toLowerCase();

    if (receiverEmail) {
      const receiverUser =
        await User.findOne({
          email: receiverEmail,
        });

      // ---------------------------------------------
      // RECEIVER HAS FINDPARCEL ACCOUNT
      // ---------------------------------------------
      if (receiverUser) {
        try {
          await Notification.create({
            customerId:
              receiverUser._id,

            title:
              "You Have a New Package",

            message:
              `Dear ${savedShipment.receiver.name}, ` +
              `you have a package from ` +
              `${savedShipment.sender.name}. ` +
              `The shipment was created on ` +
              `${new Date(
                savedShipment.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })} ` +
              `and is expected to arrive on ` +
              `${new Date(
                savedShipment.estimatedDelivery
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}. ` +
              `Package: ` +
              `${savedShipment.packageInfo.type}. ` +
              `Description: ` +
              `${savedShipment.packageInfo.description}. ` +
              `Tracking number: ` +
              `${savedShipment.trackingNumber}.`,

            type:
              "shipment_received",

            shipmentId:
              savedShipment._id,

            trackingNumber:
              savedShipment.trackingNumber,

            isRead: false,
          });

          console.log(
            `In-app notification created for receiver ${receiverEmail}`
          );
        } catch (notificationError) {
          console.error(
            "Receiver notification error:",
            notificationError.message
          );
        }
      } else {
        console.log(
          `Receiver ${receiverEmail} does not have a FindParcel account.`
        );
      }
    }

    // =================================================
    // CREATE CUSTOMER NOTIFICATION
    // =================================================

    await Notification.create({
      customerId: customer._id,

      title:
        "Shipment Created Successfully",

      message:
        `Your shipment ${savedShipment.trackingNumber} ` +
        `has been created successfully. ` +
        `Your shipping cost is ` +
        `${savedShipment.shippingPrice.toLocaleString()} FCFA.`,

      type: "shipment_created",

      shipmentId:
        savedShipment._id,

      trackingNumber:
        savedShipment.trackingNumber,

      isRead: false,
    });

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------
    res.status(201).json({
      message:
        "Shipment created successfully",

      shipment:
        savedShipment,
    });

  } catch (error) {
    console.error(
      "Create shipment error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to create shipment",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET ALL SHIPMENTS
// =====================================================
const getShipments = async (req, res) => {
  try {
    const shipments =
      await Shipment.find()
        .populate(
          "customerId",
          "fullName email"
        )
        .sort({
          createdAt: -1,
        });

    res.json(shipments);

  } catch (error) {
    console.error(
      "Get shipments error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to get shipments",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET SHIPMENTS FOR ONE CUSTOMER
// =====================================================
const getCustomerShipments = async (
  req,
  res
) => {
  try {
    const { customerId } =
      req.params;

    // ---------------------------------------------
    // CHECK CUSTOMER
    // ---------------------------------------------
    const customer =
      await User.findById(
        customerId
      );

    if (!customer) {
      return res.status(404).json({
        message:
          "Customer account not found.",
      });
    }

    // ---------------------------------------------
    // FIND CUSTOMER SHIPMENTS
    // ---------------------------------------------
    const shipments =
      await Shipment.find({
        customerId,
      }).sort({
        createdAt: -1,
      });

    res.json(shipments);

  } catch (error) {
    console.error(
      "Get customer shipments error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to get customer shipments",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET SHIPMENT BY TRACKING NUMBER
// =====================================================
const getShipmentByTrackingNumber =
  async (req, res) => {
    try {
      const trackingNumber =
        req.params.trackingNumber
          .trim()
          .toUpperCase();

      const shipment =
        await Shipment.findOne({
          trackingNumber,
        }).populate(
          "customerId",
          "fullName email"
        );

      if (!shipment) {
        return res.status(404).json({
          message:
            "Tracking number not found",
        });
      }

      res.json(shipment);

    } catch (error) {
      console.error(
        "Get shipment error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to get shipment",

        error:
          error.message,
      });
    }
  };


// =====================================================
// UPDATE SHIPMENT STATUS
// =====================================================
const updateShipmentStatus = async (
  req,
  res
) => {
  try {
    const trackingNumber =
      req.params.trackingNumber
        .trim()
        .toUpperCase();

    const { status } =
      req.body;

    // ---------------------------------------------
    // ALLOWED STATUSES
    // ---------------------------------------------
    const allowedStatuses = [
      "Pending",
      "In Transit",
      "Out for Delivery",
      "Delivered",
      "Rejected",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid shipment status.",
      });
    }

    // ---------------------------------------------
    // FIND SHIPMENT
    // ---------------------------------------------
    const shipment =
      await Shipment.findOne({
        trackingNumber,
      });

    if (!shipment) {
      return res.status(404).json({
        message:
          "Tracking number not found.",
      });
    }

    // ---------------------------------------------
    // UPDATE STATUS
    // ---------------------------------------------
    shipment.status =
      status;

    // ---------------------------------------------
    // UPDATE PROGRESS
    // ---------------------------------------------
    const statusProgress = {
      Pending: 0,

      "In Transit": 50,

      "Out for Delivery": 80,

      Delivered: 100,

      Rejected: 0,

      Cancelled: 0,
    };

    shipment.progress =
      statusProgress[status];

    // ---------------------------------------------
    // CURRENT DATE AND TIME
    // ---------------------------------------------
    const now = new Date();

    const currentDate =
      now.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

    const currentTime =
      now.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    // ---------------------------------------------
    // REJECTED
    // ---------------------------------------------
    if (status === "Rejected") {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            false;
        }
      );

      const createdEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Shipment Created"
        );

      if (createdEvent) {
        createdEvent.completed =
          true;
      }

      shipment.timeline.push({
        title:
          "Shipment Rejected",

        location:
          shipment.sender?.city ||
          "FindParcel",

        date:
          currentDate,

        time:
          currentTime,

        completed:
          true,
      });
    }

    // ---------------------------------------------
    // CANCELLED
    // ---------------------------------------------
    else if (
      status === "Cancelled"
    ) {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            false;
        }
      );

      const createdEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Shipment Created"
        );

      if (createdEvent) {
        createdEvent.completed =
          true;
      }

      shipment.timeline.push({
        title:
          "Shipment Cancelled",

        location:
          shipment.sender?.city ||
          "FindParcel",

        date:
          currentDate,

        time:
          currentTime,

        completed:
          true,
      });
    }

    // ---------------------------------------------
    // PENDING
    // ---------------------------------------------
    else if (
      status === "Pending"
    ) {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            false;
        }
      );

      const createdEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Shipment Created"
        );

      if (createdEvent) {
        createdEvent.completed =
          true;
      }
    }

    // ---------------------------------------------
    // IN TRANSIT
    // ---------------------------------------------
    else if (
      status === "In Transit"
    ) {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            false;
        }
      );

      const createdEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Shipment Created"
        );

      const pickupEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Awaiting Pickup"
        );

      const transitEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "In Transit"
        );

      if (createdEvent) {
        createdEvent.completed =
          true;
      }

      if (pickupEvent) {
        pickupEvent.completed =
          true;

        pickupEvent.date =
          currentDate;

        pickupEvent.time =
          currentTime;
      }

      if (transitEvent) {
        transitEvent.completed =
          true;

        transitEvent.date =
          currentDate;

        transitEvent.time =
          currentTime;
      }
    }

    // ---------------------------------------------
    // OUT FOR DELIVERY
    // ---------------------------------------------
    else if (
      status ===
      "Out for Delivery"
    ) {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            false;
        }
      );

      const createdEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Shipment Created"
        );

      const pickupEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Awaiting Pickup"
        );

      const transitEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "In Transit"
        );

      const deliveryEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Out for Delivery"
        );

      if (createdEvent) {
        createdEvent.completed =
          true;
      }

      if (pickupEvent) {
        pickupEvent.completed =
          true;
      }

      if (transitEvent) {
        transitEvent.completed =
          true;
      }

      if (deliveryEvent) {
        deliveryEvent.completed =
          true;

        deliveryEvent.date =
          currentDate;

        deliveryEvent.time =
          currentTime;
      }
    }

    // ---------------------------------------------
    // DELIVERED
    // ---------------------------------------------
    else if (
      status === "Delivered"
    ) {
      shipment.timeline.forEach(
        (event) => {
          event.completed =
            true;
        }
      );

      const deliveredEvent =
        shipment.timeline.find(
          (event) =>
            event.title ===
            "Delivered"
        );

      if (deliveredEvent) {
        deliveredEvent.date =
          currentDate;

        deliveredEvent.time =
          currentTime;
      }
    }

    // ---------------------------------------------
    // SAVE UPDATED SHIPMENT
    // ---------------------------------------------
    const updatedShipment =
      await shipment.save();

    res.json({
      message:
        "Shipment status updated successfully",

      shipment:
        updatedShipment,
    });

  } catch (error) {
    console.error(
      "Update shipment status error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to update shipment status",

      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================
module.exports = {
  createShipment,
  getShipments,
  getCustomerShipments,
  getShipmentByTrackingNumber,
  updateShipmentStatus,
};