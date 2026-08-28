const express = require("express");

const {
  registerUser,
  verifyEmail,
  loginUser,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();


// =====================================================
// REGISTER
// =====================================================

router.post(
  "/register",
  registerUser
);


// =====================================================
// VERIFY EMAIL
// =====================================================

router.post(
  "/verify-email",
  verifyEmail
);


// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  loginUser
);


// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
  "/profile/:id",
  updateProfile
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/password/:id",
  changePassword
);


// =====================================================
// DELETE ACCOUNT
// =====================================================

router.delete(
  "/account/:id",
  deleteAccount
);


module.exports = router;