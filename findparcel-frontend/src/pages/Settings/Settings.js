import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  // =========================================
  // THEME
  // =========================================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("findparcelTheme") === "dark"
  );

  // Apply saved theme when Settings opens
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("findparcelTheme");

    document.body.classList.toggle(
      "dark-mode",
      savedTheme === "dark"
    );
  }, []);

  // =========================================
  // GET LOGGED-IN CUSTOMER
  // =========================================

  const savedUser =
    localStorage.getItem("findparcelUser");

  let user = null;

  try {
    user = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error(
      "Invalid user data:",
      error
    );
  }

  // =========================================
  // USER ID
  // =========================================

  const customerId =
    user?._id ||
    user?.id ||
    user?.userId;

  // =========================================
  // PROFILE
  // =========================================

  const [fullName, setFullName] =
    useState(user?.fullName || "");

  const [email, setEmail] =
    useState(user?.email || "");

  const [phone, setPhone] =
    useState(user?.phone || "");

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(false);

  // =========================================
  // PASSWORD
  // =========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // =========================================
  // NOTIFICATIONS
  // =========================================

  const [
    shipmentNotifications,
    setShipmentNotifications,
  ] = useState(
    localStorage.getItem(
      "findparcelShipmentNotifications"
    ) !== "false"
  );

  const [
    deliveryNotifications,
    setDeliveryNotifications,
  ] = useState(
    localStorage.getItem(
      "findparcelDeliveryNotifications"
    ) !== "false"
  );

  const [
    promotionalNotifications,
    setPromotionalNotifications,
  ] = useState(
    localStorage.getItem(
      "findparcelPromotionalNotifications"
    ) === "true"
  );

  // =========================================
  // CHECK LOGIN
  // =========================================

  if (!user || !customerId) {
    navigate("/login");
    return null;
  }

  // =========================================
  // UPDATE PROFILE
  // =========================================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setProfileMessage("");

    if (!fullName.trim()) {
      setProfileMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      setProfileMessage(
        "Please enter your email address."
      );
      return;
    }

    try {
      setProfileLoading(true);

      const response = await fetch(
        `http://findparcel.onrender.com/api/auth/profile/${customerId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile."
        );
      }

      // Save updated user
      const updatedUser = {
        ...user,
        ...data.user,

        _id:
          data.user._id ||
          data.user.id ||
          customerId,

        id:
          data.user.id ||
          data.user._id ||
          customerId,
      };

      localStorage.setItem(
        "findparcelUser",
        JSON.stringify(updatedUser)
      );

      setFullName(
        updatedUser.fullName || ""
      );

      setEmail(
        updatedUser.email || ""
      );

      setPhone(
        updatedUser.phone || ""
      );

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileMessage(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage("");

    if (!currentPassword) {
      setPasswordMessage(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setPasswordMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(
        `http://findparcel.onrender.com/api/auth/password/${customerId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordMessage(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================================
  // SHIPMENT NOTIFICATIONS
  // =========================================

  const handleShipmentNotifications = () => {
    const newValue =
      !shipmentNotifications;

    setShipmentNotifications(newValue);

    localStorage.setItem(
      "findparcelShipmentNotifications",
      newValue
    );
  };

  // =========================================
  // DELIVERY NOTIFICATIONS
  // =========================================

  const handleDeliveryNotifications = () => {
    const newValue =
      !deliveryNotifications;

    setDeliveryNotifications(newValue);

    localStorage.setItem(
      "findparcelDeliveryNotifications",
      newValue
    );
  };

  // =========================================
  // PROMOTIONAL NOTIFICATIONS
  // =========================================

  const handlePromotionalNotifications =
    () => {
      const newValue =
        !promotionalNotifications;

      setPromotionalNotifications(
        newValue
      );

      localStorage.setItem(
        "findparcelPromotionalNotifications",
        newValue
      );
    };

  // =========================================
  // DARK / LIGHT MODE
  // =========================================

  const handleThemeToggle = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);

    localStorage.setItem(
      "findparcelTheme",
      newMode ? "dark" : "light"
    );

    document.body.classList.toggle(
      "dark-mode",
      newMode
    );
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    const confirmLogout =
      window.confirm(
        "Are you sure you want to log out?"
      );

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem(
      "findparcelUser"
    );

    navigate("/login");
  };

  // =========================================
  // DELETE ACCOUNT
  // =========================================

  const handleDeleteAccount = async () => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://findparcel.onrender.com/api/auth/account/${customerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete account."
        );
      }

      alert(
        "Your account has been deleted successfully."
      );

      localStorage.removeItem(
        "findparcelUser"
      );

      navigate("/login");
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      alert(
        error.message ||
          "Unable to delete your account."
      );
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="settings-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="settings-header">

        <Link
          to="/profile"
          className="settings-back-button"
        >
          ←
        </Link>

        <div>
          <h1>Settings</h1>

          <p>
            Manage your FindParcel account
          </p>
        </div>

      </header>


      {/* =====================================
          INTRODUCTION
      ===================================== */}

      <section className="settings-introduction">

        <h2>
          Account Settings
        </h2>

        <p>
          Update your profile, security and
          notification preferences.
        </p>

      </section>


      <div className="settings-container">

        {/* ===================================
            PROFILE SETTINGS
        =================================== */}

        <section className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-card-icon">
              👤
            </div>

            <div>
              <h3>
                Profile Information
              </h3>

              <p>
                Manage your personal information.
              </p>
            </div>

          </div>


          <form
            className="settings-form"
            onSubmit={handleProfileUpdate}
          >

            <div className="settings-form-grid">

              <div className="settings-form-group">

                <label htmlFor="settings-full-name">
                  Full Name
                </label>

                <input
                  id="settings-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="settings-email">
                  Email Address
                </label>

                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your email"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="settings-phone">
                  Phone Number
                </label>

                <input
                  id="settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Enter your phone number"
                />

              </div>

            </div>


            {profileMessage && (
              <div className="settings-message">
                {profileMessage}
              </div>
            )}


            <button
              type="submit"
              className="settings-primary-button"
              disabled={profileLoading}
            >
              {profileLoading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>

        </section>


        {/* ===================================
            PASSWORD & SECURITY
        =================================== */}

        <section className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-card-icon">
              🔒
            </div>

            <div>
              <h3>
                Password & Security
              </h3>

              <p>
                Keep your account secure.
              </p>
            </div>

          </div>


          <form
            className="settings-form"
            onSubmit={handlePasswordChange}
          >

            <div className="settings-form-group">

              <label htmlFor="current-password">
                Current Password
              </label>

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
              />

            </div>


            <div className="settings-form-grid">

              <div className="settings-form-group">

                <label htmlFor="new-password">
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                />

              </div>


              <div className="settings-form-group">

                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                />

              </div>

            </div>


            {passwordMessage && (
              <div className="settings-message">
                {passwordMessage}
              </div>
            )}


            <button
              type="submit"
              className="settings-primary-button"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>

        </section>


        {/* ===================================
            NOTIFICATIONS
        =================================== */}

        <section className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-card-icon">
              🔔
            </div>

            <div>
              <h3>
                Notifications
              </h3>

              <p>
                Choose which notifications you
                want to receive.
              </p>
            </div>

          </div>


          <div className="settings-options">

            <div className="settings-option">

              <div className="settings-option-text">

                <strong>
                  Shipment Updates
                </strong>

                <span>
                  Receive updates about your
                  shipment status.
                </span>

              </div>


              <button
                type="button"
                className={
                  shipmentNotifications
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={
                  handleShipmentNotifications
                }
                aria-label="Toggle shipment notifications"
                aria-pressed={
                  shipmentNotifications
                }
              >

                <span></span>

              </button>

            </div>


            <div className="settings-option">

              <div className="settings-option-text">

                <strong>
                  Delivery Notifications
                </strong>

                <span>
                  Get notified when your parcel
                  is ready for delivery or delivered.
                </span>

              </div>


              <button
                type="button"
                className={
                  deliveryNotifications
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={
                  handleDeliveryNotifications
                }
                aria-label="Toggle delivery notifications"
                aria-pressed={
                  deliveryNotifications
                }
              >

                <span></span>

              </button>

            </div>


            <div className="settings-option">

              <div className="settings-option-text">

                <strong>
                  Promotional Notifications
                </strong>

                <span>
                  Receive special offers and
                  FindParcel announcements.
                </span>

              </div>


              <button
                type="button"
                className={
                  promotionalNotifications
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={
                  handlePromotionalNotifications
                }
                aria-label="Toggle promotional notifications"
                aria-pressed={
                  promotionalNotifications
                }
              >

                <span></span>

              </button>

            </div>

          </div>

        </section>


        {/* ===================================
            APPEARANCE
        =================================== */}

        <section className="settings-card">

          <div className="settings-card-heading">

            <div className="settings-card-icon">
              🌓
            </div>

            <div>
              <h3>
                Appearance
              </h3>

              <p>
                Choose between light and dark mode.
              </p>
            </div>

          </div>


          <div className="settings-options">

            <div className="settings-option">

              <div className="settings-option-text">

                <strong>
                  Dark Mode
                </strong>

                <span>
                  {darkMode
                    ? "Dark mode is currently enabled."
                    : "Use dark mode for a darker interface."}
                </span>

              </div>


              <button
                type="button"
                className={
                  darkMode
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={handleThemeToggle}
                aria-label="Toggle dark mode"
                aria-pressed={darkMode}
              >

                <span></span>

              </button>

            </div>

          </div>

        </section>


        {/* ===================================
            ACCOUNT
        =================================== */}

        <section className="settings-card account-settings-card">

          <div className="settings-card-heading">

            <div className="settings-card-icon">
              ⚙️
            </div>

            <div>
              <h3>
                Account
              </h3>

              <p>
                Manage your FindParcel account.
              </p>
            </div>

          </div>


          <div className="account-actions">

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Log Out
            </button>


            <button
              type="button"
              className="delete-account-button"
              onClick={handleDeleteAccount}
            >
              🗑️ Delete Account
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Settings;