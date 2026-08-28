import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyShipments.css";

function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN CUSTOMER
  // =====================================================

  const getCustomerId = () => {
    const savedUser = localStorage.getItem("findparcelUser");

    if (!savedUser) {
      return null;
    }

    try {
      const user = JSON.parse(savedUser);

      return (
        user?._id ||
        user?.id ||
        user?.userId ||
        null
      );
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  // =====================================================
  // FETCH CUSTOMER SHIPMENTS
  // =====================================================

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const customerId = getCustomerId();

      if (!customerId) {
        setError(
          "Unable to identify your account. Please log in again."
        );

        setShipments([]);
        return;
      }

      const response = await fetch(
        `https://findparcel.onrender.com//api/shipments/customer/${customerId}`
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
        "Fetch shipments error:",
        error
      );

      setError(
        error.message ||
          "Unable to load shipments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD SHIPMENTS
  // =====================================================

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // =====================================================
  // FILTER SHIPMENTS
  // =====================================================

  const filteredShipments =
    activeFilter === "All"
      ? shipments
      : shipments.filter(
          (shipment) =>
            shipment.status === activeFilter
        );

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalShipments = shipments.length;

  const inTransitCount = shipments.filter(
    (shipment) =>
      shipment.status === "In Transit" ||
      shipment.status === "Out for Delivery"
  ).length;

  const deliveredCount = shipments.filter(
    (shipment) =>
      shipment.status === "Delivered"
  ).length;

  const pendingCount = shipments.filter(
    (shipment) =>
      shipment.status === "Pending"
  ).length;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "In Transit":
        return "transit";

      case "Delivered":
        return "delivered";

      case "Out for Delivery":
        return "out-for-delivery";

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
  // BUTTON TEXT
  // =====================================================

  const getButtonText = (status) => {
    if (
      status === "In Transit" ||
      status === "Out for Delivery"
    ) {
      return "Track";
    }

    return "View";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="shipments-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="shipments-header">

        <Link
          to="/home"
          className="shipments-back-button"
        >
          ←
        </Link>

        <div>
          <h1>My Shipments</h1>

          <p>
            Manage and track your parcels
          </p>
        </div>

      </header>


      {/* =========================
          INTRODUCTION
      ========================= */}

      <section className="shipments-introduction">

        <h2>
          Your Shipments
        </h2>

        <p>
          View all your current and previous
          shipments in one place.
        </p>

      </section>


      {/* =========================
          STATISTICS
      ========================= */}

      <section className="shipment-stats">

        <div className="stat-card">

          <div className="stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Shipments
            </span>

            <strong>
              {totalShipments}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🚚
          </div>

          <div>
            <span>
              In Transit
            </span>

            <strong>
              {inTransitCount}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            ✅
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {deliveredCount}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>
          </div>

        </div>

      </section>


      {/* =========================
          FILTER
      ========================= */}

      <section className="shipment-filter">

        {[
          "All",
          "In Transit",
          "Delivered",
          "Pending",
        ].map((filter) => (

          <button
            key={filter}
            type="button"
            className={
              activeFilter === filter
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(filter)
            }
          >
            {filter}
          </button>

        ))}

      </section>


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="shipment-message">
          Loading your shipments...
        </div>
      )}


      {/* =========================
          ERROR
      ========================= */}

      {!loading && error && (
        <div className="shipment-message error">
          {error}
        </div>
      )}


      {/* =========================
          EMPTY
      ========================= */}

      {!loading &&
        !error &&
        filteredShipments.length === 0 && (

          <div className="shipment-message">

            {shipments.length === 0
              ? "You have no shipments yet."
              : `No ${activeFilter.toLowerCase()} shipments found.`}

          </div>

        )}


      {/* =========================
          SHIPMENT LIST
      ========================= */}

      {!loading &&
        !error &&
        filteredShipments.length > 0 && (

          <section className="shipment-list">

            {filteredShipments.map(
              (shipment) => (

                <article
                  className="shipment-item"
                  key={shipment._id}
                >

                  {/* =========================
                      HEADER
                  ========================= */}

                  <div className="shipment-item-header">

                    <div className="shipment-number">

                      <div className="shipment-box-icon">
                        📦
                      </div>

                      <div>

                        <span>
                          Tracking Number
                        </span>

                        <strong>
                          {shipment.trackingNumber}
                        </strong>

                      </div>

                    </div>


                    <span
                      className={`shipment-badge ${getStatusClass(
                        shipment.status
                      )}`}
                    >
                      {shipment.status}
                    </span>

                  </div>


                  {/* =========================
                      ROUTE
                  ========================= */}

                  <div className="shipment-route">

                    <div className="location">

                      <span>
                        From
                      </span>

                      <strong>
                        {shipment.sender?.city ||
                          "N/A"}
                      </strong>

                    </div>


                    <div className="route-line">
                      ───────→
                    </div>


                    <div className="location">

                      <span>
                        To
                      </span>

                      <strong>
                        {shipment.receiver?.city ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>


                  {/* =========================
                      FOOTER
                  ========================= */}

                  <div className="shipment-footer">

                    {/* SHIPPED */}

                    <div>

                      <span>
                        Shipped
                      </span>

                      <strong>
                        {shipment.createdAt
                          ? new Date(
                              shipment.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </strong>

                    </div>


                    {/* SHIPPING PRICE */}

                    <div>

                      <span>
                        Shipping Price
                      </span>

                      <strong>
                        {shipment.shippingPrice !==
                          undefined &&
                        shipment.shippingPrice !==
                          null
                          ? `${Number(
                              shipment.shippingPrice
                            ).toLocaleString()} FCFA`
                          : "N/A"}
                      </strong>

                    </div>


                    {/* EXPECTED / DELIVERED */}

                    <div>

                      <span>
                        {shipment.status ===
                        "Delivered"
                          ? "Delivered"
                          : "Expected"}
                      </span>

                      <strong>

                        {shipment.status ===
                        "Delivered"
                          ? shipment.updatedAt
                            ? new Date(
                                shipment.updatedAt
                              ).toLocaleDateString()
                            : "N/A"
                          : shipment.estimatedDelivery ||
                            "Calculating..."}

                      </strong>

                    </div>


                    {/* TRACK / VIEW */}

                    <Link
                      to={`/track?tracking=${encodeURIComponent(
                        shipment.trackingNumber
                      )}`}
                      className="view-shipment-button"
                    >
                      {getButtonText(
                        shipment.status
                      )}
                    </Link>

                  </div>

                </article>

              )
            )}

          </section>

        )}


      {/* =========================
          CREATE SHIPMENT
      ========================= */}

      <Link
        to="/send-parcel"
        className="create-shipment-button"
      >
        + Send New Parcel
      </Link>

    </main>
  );
}

export default MyShipments;
