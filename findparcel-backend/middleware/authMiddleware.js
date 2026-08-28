const User = require("../models/User");

// =====================================================
// REQUIRE LOGIN
// =====================================================

const requireLogin = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};


// =====================================================
// REQUIRE ADMIN
// =====================================================

const requireAdmin = async (req, res, next) => {
  try {
    // Make sure the user has already been authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in.",
      });
    }

    // Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Access denied. Administrator privileges required.",
      });
    }

    next();

  } catch (error) {
    console.error(
      "Admin authorization error:",
      error.message
    );

    return res.status(403).json({
      message: "Administrator access denied.",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  requireLogin,
  requireAdmin,
};