const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// =====================================================
// EMAIL TRANSPORTER - BREVO
// =====================================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide full name, email and password.",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    // Clean email
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(400).json({
          message:
            "This email is registered but has not been verified. Please complete email verification.",
        });
      }

      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    // Determine role
    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const role =
      cleanEmail === adminEmail
        ? "admin"
        : "user";

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =====================================================
    // GENERATE VERIFICATION CODE
    // =====================================================

    const verificationCode =
      Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

    // Code expires in 10 minutes
    const verificationCodeExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    // =====================================================
    // CREATE USER
    // =====================================================

    const user = new User({
      fullName: fullName.trim(),

      email: cleanEmail,

      password: hashedPassword,

      role,

      isVerified: false,

      verificationCode,

      verificationCodeExpires,
    });

    const savedUser = await user.save();

    // =====================================================
    // SEND VERIFICATION EMAIL
    // =====================================================

    try {
      await transporter.sendMail({
       from: `"FindParcel" <${process.env.EMAIL_FROM}>`,
        to: savedUser.email,

        subject:
          "FindParcel Email Verification Code",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f5f6ff;
            border-radius: 12px;
          ">

            <h2 style="color: #3028c9;">
              Welcome to FindParcel 📦
            </h2>

            <p>
              Hello ${savedUser.fullName},
            </p>

            <p>
              Thank you for creating your FindParcel account.
              Please use the verification code below to verify
              your email address.
            </p>

            <div style="
              margin: 25px 0;
              padding: 18px;
              background: white;
              border-radius: 10px;
              text-align: center;
            ">

              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #3028c9;
              ">
                ${verificationCode}
              </span>

            </div>

            <p>
              This verification code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not create this account,
              you can ignore this email.
            </p>

            <p>
              Regards,<br />
              <strong>FindParcel Team</strong>
            </p>

          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError.message
      );

      // Remove account if email cannot be sent
      await User.findByIdAndDelete(
        savedUser._id
      );

      return res.status(500).json({
        message:
          "Account could not be created because the verification email could not be sent.",
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    res.status(201).json({
      message:
        "Account created successfully. A verification code has been sent to your email.",

      email: savedUser.email,
    });

  } catch (error) {
    console.error(
      "Register error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to create account",

      error:
        error.message,
    });
  }
};


// =====================================================
// VERIFY EMAIL
// =====================================================

const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } =
      req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        message:
          "Email and verification code are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanCode =
      verificationCode.trim();

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        message:
          "Account not found.",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        message:
          "This email has already been verified.",
      });
    }

    // Check code
    if (
      user.verificationCode !==
      cleanCode
    ) {
      return res.status(400).json({
        message:
          "Invalid verification code.",
      });
    }

    // Check expiration
    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires <
        new Date()
    ) {
      return res.status(400).json({
        message:
          "Verification code has expired. Please register again.",
      });
    }

    // Verify user
    user.isVerified = true;

    user.verificationCode = "";

    user.verificationCodeExpires =
      null;

    await user.save();

    res.json({
      message:
        "Email verified successfully.",
    });

  } catch (error) {
    console.error(
      "Email verification error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to verify email.",
      error:
        error.message,
    });
  }
};


// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please provide email and password.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // =====================================================
    // CHECK EMAIL VERIFICATION
    // =====================================================

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",
      });
    }

    // Check password
    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    res.json({
      message:
        "Login successful",

      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message:
        "Login failed",
      error:
        error.message,
    });
  }
};


// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        message:
          "Full name and email are required.",
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPhone = phone
      ? phone.trim()
      : "";

    if (!cleanName) {
      return res.status(400).json({
        message:
          "Full name cannot be empty.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        message:
          "Email cannot be empty.",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message:
          "User account not found.",
      });
    }

    const existingUser =
      await User.findOne({
        email: cleanEmail,
        _id: { $ne: id },
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Another account is already using this email.",
      });
    }

    user.fullName = cleanName;
    user.email = cleanEmail;
    user.phone = cleanPhone;

    const updatedUser =
      await user.save();

    res.json({
      message:
        "Profile updated successfully.",

      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        fullName:
          updatedUser.fullName,
        email:
          updatedUser.email,
        phone:
          updatedUser.phone || "",
        role:
          updatedUser.role,
      },
    });

  } catch (error) {
    console.error(
      "Update profile error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to update profile.",
      error:
        error.message,
    });
  }
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must contain at least 6 characters.",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message:
          "User account not found.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Current password is incorrect.",
      });
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          "New password must be different from your current password.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    res.json({
      message:
        "Password changed successfully.",
    });

  } catch (error) {
    console.error(
      "Change password error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to change password.",
      error:
        error.message,
    });
  }
};


// =====================================================
// DELETE ACCOUNT
// =====================================================

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message:
          "User account not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message:
          "Administrator accounts cannot be deleted from this page.",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message:
        "Account deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete account error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to delete account.",
      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  updateProfile,
  changePassword,
  deleteAccount,
};