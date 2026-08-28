const mongoose = require("mongoose");
const dns = require("dns");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

// =====================================================
// UPDATE ADMIN ACCOUNT
// =====================================================

const updateAdmin = async () => {
  try {
    // =====================================================
    // USE THE SAME DNS SETTINGS AS config/db.js
    // =====================================================

    const dnsServers = (
      process.env.MONGO_DNS_SERVERS || "1.1.1.1"
    )
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
    }

    // =====================================================
    // CONNECT TO MONGODB
    // =====================================================

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    // =====================================================
    // NEW ADMIN DETAILS
    // =====================================================

    const newEmail =
      "blessingmanyimuuah@gmail.com";

    const newPassword =
      "shAlom2018";

    // =====================================================
    // FIND EXISTING ADMIN
    // =====================================================

    const admin = await User.findOne({
      role: "admin",
    });

    if (!admin) {
      console.log(
        "No admin account was found in MongoDB."
      );

      await mongoose.disconnect();

      process.exit(1);
    }

    console.log(
      "Existing admin account found."
    );

    // =====================================================
    // HASH NEW PASSWORD
    // =====================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // =====================================================
    // UPDATE ADMIN
    // =====================================================

    admin.email = newEmail;

    admin.password =
      hashedPassword;

    admin.role = "admin";

    // Admin does not need email verification
    admin.isVerified = true;

    admin.verificationCode = "";

    admin.verificationCodeExpires =
      null;

    await admin.save();

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log(
      "========================================"
    );

    console.log(
      "ADMIN ACCOUNT UPDATED SUCCESSFULLY"
    );

    console.log(
      "========================================"
    );

    console.log(
      "New email:",
      newEmail
    );

    console.log(
      "New password: Updated successfully"
    );

    console.log(
      "Role:",
      admin.role
    );

    console.log(
      "========================================"
    );

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      "Failed to update admin:",
      error.message
    );

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect error
    }

    process.exit(1);
  }
};

updateAdmin();