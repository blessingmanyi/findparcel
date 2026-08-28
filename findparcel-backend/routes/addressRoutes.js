const express = require("express");

const {
  getCustomerAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const router = express.Router();


// Get customer's addresses
router.get(
  "/customer/:customerId",
  getCustomerAddresses
);


// Create address
router.post(
  "/",
  createAddress
);


// Update address
router.put(
  "/:addressId",
  updateAddress
);


// Delete address
router.delete(
  "/:addressId",
  deleteAddress
);


// Set default address
router.patch(
  "/:addressId/default",
  setDefaultAddress
);


module.exports = router;