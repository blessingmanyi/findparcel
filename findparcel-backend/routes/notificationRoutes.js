const express = require("express");

const {
  getCustomerNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();


// =====================================================
// GET ALL CUSTOMER NOTIFICATIONS
// =====================================================
router.get(
  "/customer/:customerId",
  getCustomerNotifications
);


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================
router.get(
  "/customer/:customerId/unread-count",
  getUnreadNotificationCount
);


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================
router.patch(
  "/:notificationId/read",
  markNotificationAsRead
);


// =====================================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
// =====================================================
router.patch(
  "/customer/:customerId/read-all",
  markAllNotificationsAsRead
);


module.exports = router;