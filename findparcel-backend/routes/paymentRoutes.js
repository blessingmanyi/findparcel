const express = require("express");

const {
  createMobileMoneyPayment,
  verifyMobileMoneyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// =====================================================
// CREATE MOBILE MONEY PAYMENT
// =====================================================

router.post(
  "/mobile-money",
  createMobileMoneyPayment
);


// =====================================================
// VERIFY MOBILE MONEY PAYMENT
// =====================================================

router.post(
  "/verify",
  verifyMobileMoneyPayment
);


module.exports = router;