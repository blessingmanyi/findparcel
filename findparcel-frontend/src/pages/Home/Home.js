import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // =====================================================
  // CUSTOMER
  // =====================================================

  const savedUser = localStorage.getItem("findparcelUser");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Invalid customer data:", error);
  }

  const customerName = user?.fullName || "Customer";

  const customerId =
    user?._id ||
    user?.id ||
    user?.userId ||
    null;


  // =====================================================
  // STATE
  // =====================================================

  const [shipments, setShipments] = useState([]);
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // FETCH CUSTOMER SHIPMENTS
  // =====================================================

  const fetchShipments = async () => {
    if (!customerId) {
      setError(
        "Unable to identify your account. Please log in again."
      );

      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/shipments/customer/${customerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load your shipments."
        );
      }

      setShipments(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "Dashboard shipments error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your shipments."
      );
    }
  };


  // =====================================================
  // FETCH UNREAD NOTIFICATIONS
  // =====================================================

  const fetchUnreadNotifications = async () => {
    if (!customerId) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/customer/${customerId}/unread-count`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load notifications."
        );
      }

      setUnreadNotifications(
        Number(data.count) || 0
      );

    } catch (error) {
      console.error(
        "Notification count error:",
        error
      );

      setUnreadNotifications(0);
    }
  };


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchShipments(),
        fetchUnreadNotifications(),
      ]);

      setLoading(false);
    };

    loadDashboard();
  }, [customerId]);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalShipments = shipments.length;

  const pendingCount = shipments.filter(
    (shipment) =>
      shipment.status === "Pending"
  ).length;

  const inTransitCount = shipments.filter(
    (shipment) =>
      shipment.status === "In Transit" ||
      shipment.status === "Out for Delivery"
  ).length;

  const deliveredCount = shipments.filter(
    (shipment) =>
      shipment.status === "Delivered"
  ).length;


  // =====================================================
  // RECENT SHIPMENTS
  // =====================================================

  const recentShipments = shipments.slice(0, 3);


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "In Transit":
        return "transit";

      case "Out for Delivery":
        return "out-for-delivery";

      case "Delivered":
        return "delivered";

      case "Rejected":
        return "rejected";

      case "Cancelled":
        return "cancelled";

      case "Pending":
      default:
        return "pending";
    }
  };


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
  // RENDER
  // =====================================================

  return (
    <main className="dashboard-page">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="dashboard-sidebar">

        {/* Logo */}

        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">
            📦
          </div>

          <div>
            <h1>FindParcel</h1>
            <span>
              Send • Track • Receive
            </span>
          </div>

        </div>


        {/* Customer */}

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            👤
          </div>

          <div>
            <strong>
              {customerName}
            </strong>

            <span>
              Customer
            </span>
          </div>

        </div>


        {/* Navigation */}

        <nav className="dashboard-navigation">

          <Link
            to="/home"
            className="dashboard-nav-link active"
          >
            <span>🏠</span>
            <strong>Dashboard</strong>
          </Link>


          <Link
            to="/shipments"
            className="dashboard-nav-link"
          >
            <span>📦</span>
            <strong>My Shipments</strong>
          </Link>


          <Link
            to="/track"
            className="dashboard-nav-link"
          >
            <span>🔍</span>
            <strong>Track Parcel</strong>
          </Link>


          <Link
            to="/send-parcel"
            className="dashboard-nav-link"
          >
            <span>➕</span>
            <strong>Send Parcel</strong>
          </Link>


          <Link
            to="/rate-calculator"
            className="dashboard-nav-link"
          >
            <span>💰</span>
            <strong>Rate Calculator</strong>
          </Link>


          <Link
            to="/notifications"
            className="dashboard-nav-link"
          >
            <span>🔔</span>

            <strong>
              Notifications
            </strong>

            {unreadNotifications > 0 && (
              <span className="sidebar-notification-badge">
                {unreadNotifications}
              </span>
            )}

          </Link>

        </nav>


        {/* Bottom Navigation */}

        <div className="sidebar-bottom">

          <Link
            to="/profile"
            className="dashboard-nav-link"
          >
            <span>👤</span>
            <strong>Profile</strong>
          </Link>


          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <strong>Logout</strong>
          </button>

        </div>

      </aside>


      {/* =================================
          MAIN DASHBOARD
      ================================= */}

      <section className="dashboard-main">


        {/* Header */}

        <header className="dashboard-header">

          <div>

            <p>
              Customer Dashboard
            </p>

            <h1>
              Welcome back, {customerName} 👋
            </h1>

          </div>


          <div className="dashboard-header-actions">

            {/* Notifications */}

            <Link
              to="/notifications"
              className="dashboard-icon-button"
              aria-label="Notifications"
            >
              🔔

              {unreadNotifications > 0 && (
                <span className="notification-dot"></span>
              )}

            </Link>


            {/* Profile */}

            <Link
              to="/profile"
              className="dashboard-profile-button"
              aria-label="My Profile"
            >
              👤
            </Link>

          </div>

        </header>


        {/* =================================
            TRACKING SEARCH
        ================================= */}

        <section className="dashboard-tracking-card">

          <div className="dashboard-tracking-content">

            <p>
              Track your parcel
            </p>

            <h2>
              Where is your parcel?
            </h2>

            <span>
              Enter your tracking number to see
              your shipment progress.
            </span>

          </div>


          <div className="dashboard-tracking-form">

            <input
              type="text"
              placeholder="Enter tracking number"
              id="dashboard-tracking-number"
            />

            <Link
              to="/track"
              className="dashboard-track-button"
            >
              Track Parcel
            </Link>

          </div>

        </section>


        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}


        {/* =================================
            STATISTICS
        ================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              📦
            </div>

            <div>
              <span>
                Total Shipments
              </span>

              <strong>
                {loading
                  ? "..."
                  : totalShipments}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              ⏳
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {loading
                  ? "..."
                  : pendingCount}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🚚
            </div>

            <div>
              <span>
                In Transit
              </span>

              <strong>
                {loading
                  ? "..."
                  : inTransitCount}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              ✅
            </div>

            <div>
              <span>
                Delivered
              </span>

              <strong>
                {loading
                  ? "..."
                  : deliveredCount}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================
            DASHBOARD CONTENT
        ================================= */}

        <div className="dashboard-content-grid">


          {/* =================================
              RECENT SHIPMENTS
          ================================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Recent Shipments
                </h2>

                <p>
                  Your latest shipment activity
                </p>

              </div>

              <Link to="/shipments">
                View All
              </Link>

            </div>


            {/* Loading */}

            {loading && (
              <div className="dashboard-empty-state">

                <div className="dashboard-empty-icon">
                  📦
                </div>

                <h3>
                  Loading shipments...
                </h3>

                <p>
                  Please wait while we load
                  your shipment information.
                </p>

              </div>
            )}


            {/* No shipments */}

            {!loading &&
              !error &&
              recentShipments.length === 0 && (

                <div className="dashboard-empty-state">

                  <div className="dashboard-empty-icon">
                    📦
                  </div>

                  <h3>
                    No shipments yet
                  </h3>

                  <p>
                    Your recent shipments will
                    appear here after you create
                    a shipment.
                  </p>

                  <Link
                    to="/send-parcel"
                    className="dashboard-create-button"
                  >
                    + Send New Parcel
                  </Link>

                </div>

              )}


            {/* Real Shipments */}

            {!loading &&
              recentShipments.length > 0 && (

                <div className="dashboard-recent-shipments">

                  {recentShipments.map(
                    (shipment) => (

                      <article
                        className="dashboard-shipment-card"
                        key={shipment._id}
                      >

                        {/* Shipment Header */}

                        <div className="dashboard-shipment-header">

                          <div>

                            <span>
                              Tracking Number
                            </span>

                            <strong>
                              {shipment.trackingNumber}
                            </strong>

                          </div>

                          <span
                            className={`dashboard-shipment-status ${getStatusClass(
                              shipment.status
                            )}`}
                          >
                            {shipment.status}
                          </span>

                        </div>


                        {/* Route */}

                        <div className="dashboard-shipment-route">

                          <div>

                            <span>
                              From
                            </span>

                            <strong>
                              {shipment.sender?.city ||
                                "N/A"}
                            </strong>

                          </div>


                          <span className="dashboard-route-arrow">
                            →
                          </span>


                          <div>

                            <span>
                              To
                            </span>

                            <strong>
                              {shipment.receiver?.city ||
                                "N/A"}
                            </strong>

                          </div>

                        </div>


                        {/* Shipment Details */}

                        <div className="dashboard-shipment-details">

                          <div>

                            <span>
                              Shipping Price
                            </span>

                            <strong>
                              {Number(
                                shipment.shippingPrice || 0
                              ).toLocaleString()}{" "}
                              FCFA
                            </strong>

                          </div>


                          <div>

                            <span>
                              Expected Delivery
                            </span>

                            <strong>
                              {shipment.estimatedDelivery ||
                                "Calculating..."}
                            </strong>

                          </div>

                        </div>


                        {/* Button */}

                        <Link
                          to={`/track?tracking=${encodeURIComponent(
                            shipment.trackingNumber
                          )}`}
                          className="dashboard-shipment-button"
                        >
                          {shipment.status ===
                            "In Transit" ||
                          shipment.status ===
                            "Out for Delivery"
                            ? "Track"
                            : "View"}
                        </Link>

                      </article>

                    )
                  )}

                </div>

              )}

          </section>


          {/* =================================
              QUICK ACTIONS
          ================================= */}

          <section className="dashboard-section quick-actions-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage your parcels
                </p>

              </div>

            </div>


            <div className="dashboard-quick-actions">

              <Link
                to="/send-parcel"
                className="dashboard-action"
              >
                <span>📦</span>

                <div>

                  <strong>
                    Send Parcel
                  </strong>

                  <small>
                    Book a new shipment
                  </small>

                </div>

              </Link>


              <Link
                to="/track"
                className="dashboard-action"
              >
                <span>🔍</span>

                <div>

                  <strong>
                    Track Parcel
                  </strong>

                  <small>
                    Check shipment status
                  </small>

                </div>

              </Link>


              <Link
                to="/rate-calculator"
                className="dashboard-action"
              >
                <span>💰</span>

                <div>

                  <strong>
                    Rate Calculator
                  </strong>

                  <small>
                    Calculate shipping cost
                  </small>

                </div>

              </Link>


              <Link
                to="/notifications"
                className="dashboard-action"
              >
                <span>🔔</span>

                <div>

                  <strong>
                    Notifications
                  </strong>

                  <small>
                    {unreadNotifications > 0
                      ? `${unreadNotifications} unread notification${
                          unreadNotifications > 1
                            ? "s"
                            : ""
                        }`
                      : "No unread notifications"}
                  </small>

                </div>

              </Link>

            </div>

          </section>

        </div>

      </section>


      {/* =================================
          MOBILE BOTTOM NAVIGATION
      ================================= */}

      <nav className="dashboard-mobile-nav">

        <Link to="/home">
          <span>🏠</span>
          <small>Dashboard</small>
        </Link>


        <Link to="/shipments">
          <span>📦</span>
          <small>Shipments</small>
        </Link>


        <Link
          to="/send-parcel"
          className="mobile-add-button"
        >
          +
        </Link>


        <Link to="/notifications">
          <span>🔔</span>
          <small>Notifications</small>

          {unreadNotifications > 0 && (
            <span className="mobile-notification-badge">
              {unreadNotifications}
            </span>
          )}

        </Link>


        <Link to="/profile">
          <span>👤</span>
          <small>Profile</small>
        </Link>

      </nav>

    </main>
  );
}

export default Home;