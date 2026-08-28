const express = require("express");

const {
  requireLogin,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

// Every route in this file requires:
// 1. A logged-in user
// 2. The user must be an administrator

router.use(requireLogin);
router.use(requireAdmin);


// =====================================================
// ADMIN ACCESS TEST
// =====================================================

router.get("/dashboard", (req, res) => {
  res.json({
    message: "Admin access granted.",
    admin: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
});


module.exports = router;