const Address = require("../models/Address");
const User = require("../models/User");

// =====================================================
// GET ALL ADDRESSES FOR ONE CUSTOMER
// =====================================================

const getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check customer
    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    const addresses = await Address.find({
      customerId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json(addresses);
  } catch (error) {
    console.error(
      "Get customer addresses error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to get addresses.",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE NEW ADDRESS
// =====================================================

const createAddress = async (req, res) => {
  try {
    const {
      customerId,
      label,
      fullName,
      phone,
      street,
      city,
      region,
      country,
      postalCode,
      isDefault,
    } = req.body;

    // Check required fields
    if (
      !customerId ||
      !label ||
      !fullName ||
      !phone ||
      !street ||
      !city ||
      !region
    ) {
      return res.status(400).json({
        message:
          "Please provide all required address information.",
      });
    }

    // Check customer
    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer account not found.",
      });
    }

    // If this address is default,
    // remove default from other addresses
    if (isDefault === true) {
      await Address.updateMany(
        {
          customerId,
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    const address = new Address({
      customerId,

      label: label.trim(),

      fullName: fullName.trim(),

      phone: phone.trim(),

      street: street.trim(),

      city: city.trim(),

      region: region.trim(),

      country:
        country?.trim() || "Cameroon",

      postalCode:
        postalCode?.trim() || "",

      isDefault: Boolean(isDefault),
    });

    const savedAddress =
      await address.save();

    res.status(201).json({
      message: "Address added successfully.",
      address: savedAddress,
    });
  } catch (error) {
    console.error(
      "Create address error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to create address.",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE ADDRESS
// =====================================================

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const {
      customerId,
      label,
      fullName,
      phone,
      street,
      city,
      region,
      country,
      postalCode,
      isDefault,
    } = req.body;

    // Find address
    const address = await Address.findOne({
      _id: addressId,
      customerId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    // If setting this address as default
    if (isDefault === true) {
      await Address.updateMany(
        {
          customerId,
          _id: {
            $ne: addressId,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        }
      );
    }

    address.label =
      label?.trim() || address.label;

    address.fullName =
      fullName?.trim() || address.fullName;

    address.phone =
      phone?.trim() || address.phone;

    address.street =
      street?.trim() || address.street;

    address.city =
      city?.trim() || address.city;

    address.region =
      region?.trim() || address.region;

    address.country =
      country?.trim() ||
      address.country;

    address.postalCode =
      postalCode?.trim() ||
      "";

    address.isDefault =
      Boolean(isDefault);

    const updatedAddress =
      await address.save();

    res.json({
      message:
        "Address updated successfully.",
      address: updatedAddress,
    });
  } catch (error) {
    console.error(
      "Update address error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to update address.",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE ADDRESS
// =====================================================

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { customerId } = req.body;

    const address =
      await Address.findOneAndDelete({
        _id: addressId,
        customerId,
      });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    res.json({
      message:
        "Address deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete address error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to delete address.",
      error: error.message,
    });
  }
};


// =====================================================
// SET DEFAULT ADDRESS
// =====================================================

const setDefaultAddress = async (
  req,
  res
) => {
  try {
    const { addressId } = req.params;
    const { customerId } = req.body;

    const address = await Address.findOne({
      _id: addressId,
      customerId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found.",
      });
    }

    // Remove default from all customer's addresses
    await Address.updateMany(
      {
        customerId,
      },
      {
        $set: {
          isDefault: false,
        },
      }
    );

    // Make selected address default
    address.isDefault = true;

    const updatedAddress =
      await address.save();

    res.json({
      message:
        "Default address updated successfully.",
      address: updatedAddress,
    });
  } catch (error) {
    console.error(
      "Set default address error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to set default address.",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getCustomerAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};