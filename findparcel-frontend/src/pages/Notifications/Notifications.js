import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN CUSTOMER
  // =====================================================

  const getCustomerId = () => {
    const savedUser =
      localStorage.getItem("findparcelUser");

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
      console.error(
        "Invalid user data:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const customerId = getCustomerId();

      if (!customerId) {
        setError(
          "Unable to identify your account. Please log in again."
        );

        setNotifications([]);

        return;
      }

      const response = await fetch(
        `https://findparcel.onrender.com/api/notifications/customer/${customerId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );

      setError(
        error.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `https://findparcel.onrender.com/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const customerId = getCustomerId();

      if (!customerId) {
        return;
      }

      const response = await fetch(
        `https://findparcel.onrender.com/api/notifications/customer/${customerId}/read-all`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="notifications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="notifications-header">

        <Link
          to="/home"
          className="notifications-back-button"
        >
          ←
        </Link>

        <div>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated about your shipments
          </p>

        </div>

      </header>


      {/* =================================================
          TOP BAR
      ================================================= */}

      <section className="notifications-top">

        <div>

          <h2>
            Your Notifications
          </h2>

          <p>
            {unreadCount === 0
              ? "You have no unread notifications."
              : `You have ${unreadCount} unread ${
                  unreadCount === 1
                    ? "notification"
                    : "notifications"
                }.`}
          </p>

        </div>


        {unreadCount > 0 && (

          <button
            type="button"
            className="mark-all-button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>

        )}

      </section>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="notification-message">
          Loading notifications...
        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div className="notification-message error">
          {error}
        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        notifications.length === 0 && (

          <div className="notification-empty">

            <div className="notification-empty-icon">
              🔔
            </div>

            <h3>
              No notifications yet
            </h3>

            <p>
              When you create a shipment or your
              shipment status changes, your
              notifications will appear here.
            </p>

          </div>

        )}


      {/* =================================================
          NOTIFICATION LIST
      ================================================= */}

      {!loading &&
        !error &&
        notifications.length > 0 && (

          <section className="notification-list">

            {notifications.map(
              (notification) => (

                <article
                  key={notification._id}
                  className={
                    notification.isRead
                      ? "notification-card read"
                      : "notification-card unread"
                  }
                  onClick={() =>
                    !notification.isRead &&
                    markAsRead(
                      notification._id
                    )
                  }
                >

                  {/* ICON */}

                  <div className="notification-icon">

                    {notification.type ===
                    "shipment_created"
                      ? "📦"
                      : notification.type ===
                        "shipment_status"
                      ? "🚚"
                      : "🔔"}

                  </div>


                  {/* CONTENT */}

                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.isRead && (

                        <span
                          className="unread-dot"
                        ></span>

                      )}

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    {notification.trackingNumber && (

                      <strong
                        className="notification-tracking"
                      >
                        Tracking Number:{" "}
                        {notification.trackingNumber}
                      </strong>

                    )}


                    <span
                      className="notification-date"
                    >
                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                  </div>

                </article>

              )
            )}

          </section>

        )}

    </main>
  );
}

export default Notifications;
