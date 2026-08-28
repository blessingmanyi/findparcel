import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminShipments.css";

function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSection, setActiveSection] = useState("Dashboard");

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("https://findparcel.onrender.com/api/shipments");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load shipments.");
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch shipments error:", err);
      setError(err.message || "Unable to load shipments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const updateStatus = async (trackingNumber, newStatus) => {
    try {
      setUpdatingId(trackingNumber);
      setError("");
      setSuccessMessage("");
      const response = await fetch(
        `https://findparcel.onrender.com/api/shipments/${trackingNumber}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update shipment.");
      setShipments((current) => current.map((shipment) =>
        shipment.trackingNumber === trackingNumber ? data.shipment : shipment
      ));
      setSuccessMessage(`${trackingNumber} status updated to ${newStatus}.`);
    } catch (err) {
      console.error("Update shipment error:", err);
      setError(err.message || "Unable to update shipment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectShipment = (trackingNumber) => {
    if (window.confirm(`Are you sure you want to reject shipment ${trackingNumber}?`)) {
      updateStatus(trackingNumber, "Rejected");
    }
  };

  const cancelShipment = (trackingNumber) => {
    if (window.confirm(`Are you sure you want to cancel shipment ${trackingNumber}?`)) {
      updateStatus(trackingNumber, "Cancelled");
    }
  };

  const statusOptions = ["Pending", "In Transit", "Out for Delivery", "Delivered"];

  const stats = useMemo(() => ({
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "Pending").length,
    transit: shipments.filter((s) => s.status === "In Transit").length,
    delivery: shipments.filter((s) => s.status === "Out for Delivery").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length,
    rejected: shipments.filter((s) => s.status === "Rejected").length,
    cancelled: shipments.filter((s) => s.status === "Cancelled").length,
  }), [shipments]);

  const sidebarItems = [
    { key: "All", label: "Total Shipments", icon: "📦", count: stats.total },
    { key: "Pending", label: "Pending", icon: "⏳", count: stats.pending },
    { key: "In Transit", label: "In Transit", icon: "🚚", count: stats.transit },
    { key: "Out for Delivery", label: "Out for Delivery", icon: "🚗", count: stats.delivery },
    { key: "Delivered", label: "Delivered", icon: "✅", count: stats.delivered },
    { key: "Rejected", label: "Rejected", icon: "❌", count: stats.rejected },
    { key: "Cancelled", label: "Cancelled", icon: "🚫", count: stats.cancelled },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const revenue = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    const day = startWeek.getDay();
    startWeek.setDate(startWeek.getDate() - (day === 0 ? 6 : day - 1));
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prices = shipments.map((s) => Number(s.shippingPrice) || 0);
    const sum = (list) => list.reduce((total, s) => total + (Number(s.shippingPrice) || 0), 0);
    return {
      total: prices.reduce((a, b) => a + b, 0),
      today: sum(shipments.filter((s) => new Date(s.createdAt) >= startToday)),
      week: sum(shipments.filter((s) => new Date(s.createdAt) >= startWeek)),
      month: sum(shipments.filter((s) => new Date(s.createdAt) >= startMonth)),
      average: shipments.length ? prices.reduce((a, b) => a + b, 0) / shipments.length : 0,
    };
  }, [shipments]);

  const monthlyShipments = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      return { label: date.toLocaleDateString("en-US", { month: "short" }), year: date.getFullYear(), month: date.getMonth(), count: 0 };
    });
    shipments.forEach((shipment) => {
      const date = new Date(shipment.createdAt);
      const item = months.find((m) => m.year === date.getFullYear() && m.month === date.getMonth());
      if (item) item.count += 1;
    });
    return months;
  }, [shipments]);

  const maxMonthly = Math.max(...monthlyShipments.map((m) => m.count), 1);

  const routes = useMemo(() => {
    const routeMap = {};
    shipments.forEach((s) => {
      const from = s.sender?.city || "Unknown";
      const to = s.receiver?.city || "Unknown";
      const key = `${from} → ${to}`;
      routeMap[key] = (routeMap[key] || 0) + 1;
    });
    return Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [shipments]);

  const customers = useMemo(() => {
    const map = new Map();
    shipments.forEach((s) => {
      const customer = s.customerId;
      const email = typeof customer === "object" ? customer?.email : "";
      const name = typeof customer === "object" ? customer?.fullName : s.sender?.name;
      const key = email || name || s.sender?.email || s.sender?.name;
      if (!key) return;
      if (!map.has(key)) map.set(key, { name: name || "Customer", email: email || s.sender?.email || "N/A", shipments: 0 });
      map.get(key).shipments += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.shipments - a.shipments);
  }, [shipments]);

  const notifications = useMemo(() => shipments.slice(0, 8).map((s) => ({
    id: s._id,
    trackingNumber: s.trackingNumber,
    status: s.status,
    customer: s.customerId?.fullName || s.sender?.name || "Customer",
    email: s.customerId?.email || s.sender?.email || s.receiver?.email || "N/A",
    date: s.updatedAt || s.createdAt,
  })), [shipments]);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesStatus = activeFilter === "All" || shipment.status === activeFilter;
    if (!matchesStatus) return false;
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return [
      shipment.trackingNumber,
      shipment.sender?.name,
      shipment.receiver?.name,
      shipment.sender?.email,
      shipment.receiver?.email,
      shipment.sender?.phone,
      shipment.receiver?.phone,
      shipment.sender?.city,
      shipment.receiver?.city,
    ].some((value) => String(value || "").toLowerCase().includes(search));
  });

  const currentFilter = sidebarItems.find((item) => item.key === activeFilter);
  const money = (value) => `${Number(value || 0).toLocaleString()} FCFA`;

  const adminNav = [
    { key: "Dashboard", label: "Dashboard", icon: "▦" },
    { key: "Shipments", label: "Shipments", icon: "📦" },
    { key: "Customers", label: "Customers", icon: "👥" },
    { key: "Notifications", label: "Notifications", icon: "🔔" },
  ];

  const renderShipmentCard = (shipment) => {
    const isUpdating = updatingId === shipment.trackingNumber;
    const isFinalStatus = ["Delivered", "Rejected", "Cancelled"].includes(shipment.status);
    return (
      <article className="admin-shipment-card" key={shipment._id}>
        <div className="admin-card-header">
          <div><span>Tracking Number</span><strong>{shipment.trackingNumber}</strong></div>
          <span className={`admin-status-badge ${shipment.status?.toLowerCase().replaceAll(" ", "-")}`}>{shipment.status}</span>
        </div>
        <div className="admin-route">
          <div><span>From</span><strong>{shipment.sender?.city || "N/A"}</strong></div>
          <span className="admin-arrow">→</span>
          <div><span>To</span><strong>{shipment.receiver?.city || "N/A"}</strong></div>
        </div>
        <div className="admin-shipment-info">
          <div><span>Sender</span><strong>{shipment.sender?.name || "N/A"}</strong><small>{shipment.sender?.email || shipment.sender?.phone || "No contact"}</small></div>
          <div><span>Receiver</span><strong>{shipment.receiver?.name || "N/A"}</strong><small>{shipment.receiver?.email || shipment.receiver?.phone || "No contact"}</small></div>
          <div><span>Package</span><strong>{shipment.packageInfo?.type || "N/A"}</strong></div>
          <div><span>Weight</span><strong>{shipment.packageInfo?.weight || 0} kg</strong></div>
          <div><span>Shipping Price</span><strong>{money(shipment.shippingPrice)}</strong></div>
          <div><span>Created</span><strong>{formatDate(shipment.createdAt)}</strong><small>{formatTime(shipment.createdAt)}</small></div>
          <div><span>Expected Delivery</span><strong>{formatDate(shipment.estimatedDelivery)}</strong></div>
          <div><span>Delivery Speed</span><strong>{shipment.deliverySpeed === "express" ? "Express" : "Standard"}</strong></div>
        </div>
        <div className="admin-package-description"><span>Package Description</span><p>{shipment.packageInfo?.description || "No description provided."}</p></div>
        <div className="admin-progress-section">
          <div className="admin-progress-heading"><span>Delivery Progress</span><strong>{shipment.progress || 0}%</strong></div>
          <div className="admin-progress-bar"><div className="admin-progress-fill" style={{ width: `${shipment.progress || 0}%` }} /></div>
        </div>
        <div className="admin-status-controls">
          <label htmlFor={`status-${shipment._id}`}>Update Status</label>
          <select id={`status-${shipment._id}`} value={shipment.status || "Pending"} disabled={isUpdating || isFinalStatus} onChange={(e) => updateStatus(shipment.trackingNumber, e.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          {isUpdating && <span className="admin-updating">Updating...</span>}
        </div>
        {!isFinalStatus && <div className="admin-action-buttons">
          <button type="button" className="admin-reject-button" disabled={isUpdating} onClick={() => rejectShipment(shipment.trackingNumber)}>❌ Reject Shipment</button>
          <button type="button" className="admin-cancel-button" disabled={isUpdating} onClick={() => cancelShipment(shipment.trackingNumber)}>🚫 Cancel Shipment</button>
        </div>}
        <Link to={`/track?tracking=${encodeURIComponent(shipment.trackingNumber)}`} className="admin-view-button">View Shipment →</Link>
      </article>
    );
  };

  return (
    <main className="admin-shipments-page">
      <header className="admin-shipments-header">
        <Link to="/home" className="admin-back-button">←</Link>
        <div><h1>FindParcel Admin</h1><p>Shipment Management Dashboard</p></div>
      </header>

      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title"><span>📊</span><div><strong>Dashboard</strong><small>FindParcel Admin</small></div></div>
          <nav className="admin-main-nav">
            {adminNav.map((item) => <button key={item.key} type="button" className={`admin-main-nav-item ${activeSection === item.key ? "active" : ""}`} onClick={() => setActiveSection(item.key)}><span>{item.icon}</span>{item.label}</button>)}
          </nav>
          <div className="admin-sidebar-divider" />
          <span className="admin-sidebar-heading">SHIPMENT STATUS</span>
          <nav className="admin-sidebar-nav">
            {sidebarItems.map((item) => <button key={item.key} type="button" className={`admin-sidebar-item ${activeFilter === item.key && activeSection === "Shipments" ? "active" : ""}`} onClick={() => { setActiveSection("Shipments"); setActiveFilter(item.key); }}><span className="admin-sidebar-icon">{item.icon}</span><span className="admin-sidebar-label">{item.label}</span><span className="admin-sidebar-count">{item.count}</span></button>)}
          </nav>
          <div className="admin-sidebar-footer"><span>👤</span><div><strong>Administrator</strong><small>FindParcel</small></div></div>
          <button type="button" className="admin-logout-button" onClick={() => { localStorage.removeItem("findparcelUser"); window.location.href = "/login"; }}>🚪 Logout</button>
        </aside>

        <section className="admin-dashboard-content">
          <section className="admin-introduction">
            <div><h2>{activeSection === "Dashboard" ? "Dashboard Overview" : activeSection}</h2><p>{activeSection === "Dashboard" ? "Real-time overview of your FindParcel operations." : `Manage ${activeSection.toLowerCase()} using live shipment data.`}</p></div>
            <button type="button" className="admin-refresh-button" onClick={fetchShipments} disabled={loading}>🔄 Refresh</button>
          </section>

          {successMessage && <div className="admin-success"><span>✓</span>{successMessage}</div>}
          {error && <div className="admin-error"><span>⚠</span>{error}</div>}

          {activeSection === "Dashboard" && (
            <>
              <section className="admin-overview-cards">
                <div><span>📦</span><small>Total Shipments</small><strong>{stats.total}</strong></div>
                <div><span>💰</span><small>Total Revenue</small><strong>{money(revenue.total)}</strong></div>
                <div><span>🚚</span><small>In Transit</small><strong>{stats.transit}</strong></div>
                <div><span>✅</span><small>Delivered</small><strong>{stats.delivered}</strong></div>
              </section>

              <section className="admin-analytics-grid">
                <div className="admin-panel admin-chart-panel"><div className="admin-panel-heading"><div><h3>Shipments This Month</h3><p>Actual shipments created over the last six months</p></div></div><div className="admin-month-chart">{monthlyShipments.map((month) => <div className="admin-month-column" key={`${month.year}-${month.month}`}><span>{month.count}</span><div className="admin-month-bar"><i style={{ height: `${Math.max((month.count / maxMonthly) * 100, month.count ? 8 : 0)}%` }} /></div><small>{month.label}</small></div>)}</div></div>
                <div className="admin-panel"><div className="admin-panel-heading"><div><h3>Shipment Status</h3><p>Current distribution</p></div></div><div className="admin-status-analytics">{sidebarItems.slice(1).map((item) => <div key={item.key}><span>{item.icon} {item.label}</span><strong>{item.count}</strong><div><i style={{ width: `${stats.total ? (item.count / stats.total) * 100 : 0}%` }} /></div></div>)}</div></div>
              </section>

              <section className="admin-analytics-grid">
                <div className="admin-panel"><div className="admin-panel-heading"><div><h3>Most Popular Routes</h3><p>Calculated from actual shipment records</p></div></div>{routes.length ? <div className="admin-route-list">{routes.map(([route, count]) => <div key={route}><span>{route}</span><strong>{count} shipments</strong></div>)}</div> : <div className="admin-empty-panel">No route data available yet.</div>}</div>
                <div className="admin-panel"><div className="admin-panel-heading"><div><h3>Revenue / Shipping Prices</h3><p>Calculated from saved shipping prices</p></div></div><div className="admin-revenue-grid"><div><small>Total Revenue</small><strong>{money(revenue.total)}</strong></div><div><small>Today's Revenue</small><strong>{money(revenue.today)}</strong></div><div><small>This Week</small><strong>{money(revenue.week)}</strong></div><div><small>This Month</small><strong>{money(revenue.month)}</strong></div><div><small>Average Shipment Price</small><strong>{money(revenue.average)}</strong></div></div></div>
              </section>
            </>
          )}

          {activeSection === "Shipments" && (
            <>
              <section className="admin-search-section"><label htmlFor="shipment-search">Search Shipments</label><input type="text" id="shipment-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tracking number, sender, receiver, contact or city..." /></section>
              <div className="admin-filter-title"><strong>{currentFilter?.label || "All Shipments"}</strong><span>{filteredShipments.length} result{filteredShipments.length === 1 ? "" : "s"}</span></div>
              {loading ? <div className="admin-message"><span className="admin-spinner">⟳</span>Loading shipments...</div> : filteredShipments.length ? <section className="admin-shipment-list">{filteredShipments.map(renderShipmentCard)}</section> : <div className="admin-message"><strong>No shipments found</strong><span>No shipments match the selected filter or search.</span></div>}
            </>
          )}

          {activeSection === "Customers" && (
            <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><h3>Customer Information</h3><p>Customers derived from real shipment/customer records.</p></div><strong>{customers.length} customers</strong></div>{customers.length ? <div className="admin-customer-table"><div className="admin-table-row admin-table-head"><span>Customer</span><span>Email</span><span>Shipments</span></div>{customers.map((customer) => <div className="admin-table-row" key={`${customer.email}-${customer.name}`}><span>{customer.name}</span><span>{customer.email}</span><strong>{customer.shipments}</strong></div>)}</div> : <div className="admin-empty-panel">No customer information is available yet.</div>}</section>
          )}

          {activeSection === "Notifications" && (
            <section className="admin-panel admin-full-panel"><div className="admin-panel-heading"><div><h3>Customer Notifications</h3><p>Recent shipment activity and customer contact details from your shipment records.</p></div></div>{notifications.length ? <div className="admin-notification-list">{notifications.map((notification) => <div className="admin-notification-item" key={notification.id}><span>🔔</span><div><strong>{notification.trackingNumber} is now {notification.status}</strong><p>Customer: {notification.customer} · {notification.email}</p><small>{formatDate(notification.date)} {formatTime(notification.date)}</small></div></div>)}</div> : <div className="admin-empty-panel">No shipment notification activity available yet.</div>}</section>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminShipments;