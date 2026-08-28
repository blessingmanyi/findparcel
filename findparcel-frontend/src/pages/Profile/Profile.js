import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);

  // =====================================================
  // GET LOGGED-IN CUSTOMER
  // =====================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("findparcelUser");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      setUser(loggedInUser);
    } catch (error) {
      console.error(
        "User data error:",
        error
      );

      localStorage.removeItem(
        "findparcelUser"
      );

      navigate("/login");
    }
  }, [navigate]);

  // =====================================================
  // GET CUSTOMER SHIPMENTS
  // =====================================================

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/shipments"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load shipments"
          );
        }

        const data = await response.json();

        const savedUser =
          localStorage.getItem(
            "findparcelUser"
          );

        if (!savedUser) {
          return;
        }

        const loggedInUser =
          JSON.parse(savedUser);

        // Show shipments connected to
        // the logged-in customer
        const customerShipments =
          data.filter(
            (shipment) =>
              shipment.sender?.email
                ?.toLowerCase() ===
                loggedInUser.email
                  ?.toLowerCase() ||
              shipment.receiver?.email
                ?.toLowerCase() ===
                loggedInUser.email
                  ?.toLowerCase()
          );

        setShipments(
          customerShipments
        );
      } catch (error) {
        console.error(
          "Fetch customer shipments error:",
          error
        );
      }
    };

    fetchShipments();
  }, []);

  // =====================================================
  // SHIPMENT STATISTICS
  // =====================================================

  const totalShipments =
    shipments.length;

  const deliveredCount =
    shipments.filter(
      (shipment) =>
        shipment.status === "Delivered"
    ).length;

  const inTransitCount =
    shipments.filter(
      (shipment) =>
        shipment.status === "In Transit"
    ).length;

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "findparcelUser"
    );

    navigate("/login");
  };

  // =====================================================
  // WAIT FOR USER
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="profile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="profile-header">

        <Link
          to="/home"
          className="profile-back-button"
        >
          ←
        </Link>

        <h1>
          Profile
        </h1>

        <Link
          to="/notifications"
          className="profile-notification-button"
        >
          🔔
        </Link>

      </header>


      {/* =================================================
          PROFILE INFORMATION
      ================================================= */}

      <section className="profile-user-section">

        <div className="profile-avatar">
          {user.fullName
            ? user.fullName
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

        <h2>
          {user.fullName}
        </h2>

        <p>
          {user.email}
        </p>

      </section>


      {/* =================================================
          SHIPMENT STATISTICS
      ================================================= */}

      <section className="profile-statistics">

        <div className="profile-stat">

          <strong>
            {totalShipments}
          </strong>

          <span>
            Total Shipments
          </span>

        </div>


        <div className="profile-stat">

          <strong>
            {deliveredCount}
          </strong>

          <span>
            Delivered
          </span>

        </div>


        <div className="profile-stat">

          <strong>
            {inTransitCount}
          </strong>

          <span>
            In Transit
          </span>

        </div>

      </section>


      {/* =================================================
          ACCOUNT MENU
      ================================================= */}

      <section className="profile-menu">

        {/* =================================================
            MY SHIPMENTS
        ================================================= */}

        <Link
          to="/shipments"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            📦
          </div>

          <div className="profile-menu-text">

            <strong>
              My Shipments
            </strong>

            <span>
              Monitor your parcels
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Link
          to="/notifications"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            🔔
          </div>

          <div className="profile-menu-text">

            <strong>
              Notifications
            </strong>

            <span>
              Shipment and payment updates
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            MY ADDRESSES
        ================================================= */}

        <Link
          to="/addresses"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            📍
          </div>

          <div className="profile-menu-text">

            <strong>
              My Addresses
            </strong>

            <span>
              Manage delivery addresses
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        <Link
          to="/payment-methods"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            💳
          </div>

          <div className="profile-menu-text">

            <strong>
              Payment Methods
            </strong>

            <span>
              Manage your payments
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            HELP & SUPPORT
        ================================================= */}

        <Link
          to="/help"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            ❓
          </div>

          <div className="profile-menu-text">

            <strong>
              Help & Support
            </strong>

            <span>
              Get assistance
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Link
          to="/settings"
          className="profile-menu-item"
        >

          <div className="profile-menu-icon">
            ⚙️
          </div>

          <div className="profile-menu-text">

            <strong>
              Settings
            </strong>

            <span>
              Manage your account
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </Link>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"
          className="profile-menu-item logout-item"
          onClick={handleLogout}
        >

          <div className="profile-menu-icon">
            🚪
          </div>

          <div className="profile-menu-text">

            <strong>
              Logout
            </strong>

            <span>
              Sign out of your account
            </span>

          </div>

          <span className="profile-menu-arrow">
            ›
          </span>

        </button>

      </section>


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <nav className="profile-bottom-nav">

        <Link to="/home">

          <span>
            🏠
          </span>

          <small>
            Home
          </small>

        </Link>


        <Link to="/shipments">

          <span>
            📦
          </span>

          <small>
            Shipments
          </small>

        </Link>


        <Link
          to="/send-parcel"
          className="profile-add-button"
        >
          +
        </Link>


        <Link to="/notifications">

          <span>
            🔔
          </span>

          <small>
            Notifications
          </small>

        </Link>


        <Link
          to="/profile"
          className="active"
        >

          <span>
            👤
          </span>

          <small>
            Profile
          </small>

        </Link>

      </nav>

    </main>
  );
}

export default Profile;