const Notification = require("../models/Notification");
const User = require("../models/User");

// =====================================================
// GET CUSTOMER NOTIFICATIONS
// =====================================================
const getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    // ---------------------------------------------
    // CHECK CUSTOMER ID
    // ---------------------------------------------
    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required.",
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
    // GET NOTIFICATIONS
    // ---------------------------------------------
    const notifications = await Notification.find({
      customerId,
    }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to get notifications.",
      error: error.message,
    });
  }
};


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================
const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required.",
      });
    }

    const count = await Notification.countDocuments({
      customerId,
      isRead: false,
    });

    res.json({
      count,
    });
  } catch (error) {
    console.error(
      "Unread notification count error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to get notification count.",
      error: error.message,
    });
  }
};


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================
const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { notificationId } = req.params;

    const notification =
      await Notification.findById(
        notificationId
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    notification.isRead = true;

    const updatedNotification =
      await notification.save();

    res.json({
      message:
        "Notification marked as read.",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to update notification.",
      error: error.message,
    });
  }
};


// =====================================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
// =====================================================
const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required.",
      });
    }

    await Notification.updateMany(
      {
        customerId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.json({
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to update notifications.",
      error: error.message,
    });
  }
};


module.exports = {
  getCustomerNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};