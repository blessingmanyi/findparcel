
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TrackParcel.css";

// =====================================================
// BACKEND URL
// =====================================================

const API_URL = "https://findparcel.onrender.com";

// =====================================================
// DEFAULT CITY COORDINATES
// =====================================================

const CITY_COORDINATES = {
  buea: [4.1527, 9.241],
  douala: [4.0511, 9.7679],
  yaounde: [3.848, 11.5021],
  limbe: [4.0236, 9.2066],
  bamenda: [5.9631, 10.1591],
  bafoussam: [5.4781, 10.4179],
  kribi: [2.9406, 9.9103],
  edea: [3.8, 10.1333],
  bertoua: [4.5773, 13.6846],
  garoua: [9.3014, 13.3977],
  maroua: [10.591, 14.3159],
  ngaoundere: [7.3167, 13.5833],
};

// =====================================================
// FIND CITY COORDINATES
// =====================================================

const getCityCoordinates = (city) => {
  if (!city) {
    return null;
  }

  const cleanCity = city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return CITY_COORDINATES[cleanCity] || null;
};

// =====================================================
// CALCULATE LIVE PROGRESS
// =====================================================

const calculateParcelProgress = (shipment) => {
  if (!shipment) {
    return 0;
  }

  // Delivered = 100%
  if (shipment.status === "Delivered") {
    return 100;
  }

  // Rejected / Cancelled = 0%
  if (
    shipment.status === "Rejected" ||
    shipment.status === "Cancelled"
  ) {
    return 0;
  }

  const createdDate = new Date(shipment.createdAt);
  const deliveryDate = new Date(shipment.estimatedDelivery);
  const now = new Date();

  // ---------------------------------------------------
  // FALLBACK TO BACKEND PROGRESS
  // ---------------------------------------------------

  if (
    Number.isNaN(createdDate.getTime()) ||
    Number.isNaN(deliveryDate.getTime())
  ) {
    return Math.max(
      0,
      Math.min(100, Number(shipment.progress) || 0)
    );
  }

  const totalTime =
    deliveryDate.getTime() - createdDate.getTime();

  const elapsedTime =
    now.getTime() - createdDate.getTime();

  if (totalTime <= 0) {
    return 100;
  }

  let progress =
    (elapsedTime / totalTime) * 100;

  progress = Math.max(
    0,
    Math.min(100, progress)
  );

  return Math.round(progress);
};

// =====================================================
// CALCULATE PARCEL POSITION
// =====================================================

const calculateParcelPosition = (shipment) => {
  const start = getCityCoordinates(
    shipment?.sender?.city
  );

  const destination = getCityCoordinates(
    shipment?.receiver?.city
  );

  if (!start || !destination) {
    return null;
  }

  // Delivered = destination
  if (shipment.status === "Delivered") {
    return destination;
  }

  // Rejected / Cancelled = origin
  if (
    shipment.status === "Rejected" ||
    shipment.status === "Cancelled"
  ) {
    return start;
  }

  const createdDate = new Date(shipment.createdAt);
  const deliveryDate = new Date(
    shipment.estimatedDelivery
  );

  const now = new Date();

  // ---------------------------------------------------
  // FALLBACK TO BACKEND PROGRESS
  // ---------------------------------------------------

  if (
    Number.isNaN(createdDate.getTime()) ||
    Number.isNaN(deliveryDate.getTime())
  ) {
    const progress =
      Math.max(
        0,
        Math.min(
          100,
          Number(shipment.progress) || 0
        )
      ) / 100;

    return [
      start[0] +
        (destination[0] - start[0]) * progress,

      start[1] +
        (destination[1] - start[1]) * progress,
    ];
  }

  const totalTime =
    deliveryDate.getTime() -
    createdDate.getTime();

  const elapsedTime =
    now.getTime() -
    createdDate.getTime();

  let progress =
    totalTime > 0
      ? elapsedTime / totalTime
      : 0;

  progress = Math.max(
    0,
    Math.min(1, progress)
  );

  return [
    start[0] +
      (destination[0] - start[0]) * progress,

    start[1] +
      (destination[1] - start[1]) * progress,
  ];
};

// =====================================================
// PARCEL ICON
// =====================================================

const parcelIcon = new L.DivIcon({
  className: "parcel-map-marker-wrapper",

  html: `
    <div class="parcel-map-marker">
      <span></span>
    </div>
  `,

  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// =====================================================
// START LOCATION ICON
// =====================================================

const startIcon = new L.DivIcon({
  className: "map-location-marker-wrapper",

  html: `
    <div class="map-start-marker">
      ●
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// =====================================================
// DESTINATION ICON
// =====================================================

const destinationIcon = new L.DivIcon({
  className: "map-location-marker-wrapper",

  html: `
    <div class="map-destination-marker">
      ●
    </div>
  `,

  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// =====================================================
// MAP AUTO CENTER
// =====================================================

function MapViewController({
  start,
  destination,
  parcelPosition,
}) {
  const map = useMap();

  useEffect(() => {
    if (!start || !destination) {
      return;
    }

    const bounds = L.latLngBounds([
      start,
      destination,
    ]);

    if (parcelPosition) {
      bounds.extend(parcelPosition);
    }

    map.fitBounds(bounds, {
      padding: [45, 45],
    });
  }, [
    map,
    start,
    destination,
    parcelPosition,
  ]);

  return null;
}

// =====================================================
// TRACK PARCEL
// =====================================================

function TrackParcel() {
  const [searchParams] = useSearchParams();

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [shipment, setShipment] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [parcelPosition, setParcelPosition] =
    useState(null);

  const [liveProgress, setLiveProgress] =
    useState(0);

  // ===================================================
  // FIND SHIPMENT
  // ===================================================

  const findShipment = useCallback(
    async (number) => {
      const formattedNumber =
        number.trim().toUpperCase();

      if (!formattedNumber) {
        return null;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/shipments/${encodeURIComponent(
            formattedNumber
          )}`
        );

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        return data.shipment || data;
      } catch (error) {
        console.error(
          "Error finding shipment:",
          error
        );

        throw error;
      }
    },
    []
  );

  // ===================================================
  // TRACK PARCEL
  // ===================================================

  const handleTrack = async (e) => {
    e.preventDefault();

    setError("");
    setShipment(null);
    setParcelPosition(null);
    setLiveProgress(0);

    const formattedTracking =
      trackingNumber.trim().toUpperCase();

    if (!formattedTracking) {
      setError(
        "Please enter a tracking number."
      );

      return;
    }

    setLoading(true);

    try {
      const foundShipment =
        await findShipment(
          formattedTracking
        );

      if (foundShipment) {
        setTrackingNumber(
          formattedTracking
        );

        setShipment(foundShipment);
      } else {
        setError(
          "Tracking number not found."
        );
      }
    } catch (error) {
      console.error(
        "Tracking error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // AUTOMATIC TRACKING FROM URL
  // ===================================================

  useEffect(() => {
    const trackingFromUrl =
      searchParams.get("tracking");

    if (!trackingFromUrl) {
      return;
    }

    const formattedTracking =
      trackingFromUrl.trim().toUpperCase();

    setTrackingNumber(
      formattedTracking
    );

    setError("");
    setShipment(null);
    setParcelPosition(null);
    setLiveProgress(0);
    setLoading(true);

    findShipment(formattedTracking)
      .then((foundShipment) => {
        if (foundShipment) {
          setShipment(foundShipment);
        } else {
          setError(
            "Tracking number not found."
          );
        }
      })
      .catch((error) => {
        console.error(
          "Automatic tracking error:",
          error
        );

        setError(
          "Unable to connect to the server. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    searchParams,
    findShipment,
  ]);

  // ===================================================
  // MOVE PARCEL + UPDATE LIVE PROGRESS
  // ===================================================

  useEffect(() => {
    if (!shipment) {
      return;
    }

    const updateTracking = () => {
      const position =
        calculateParcelPosition(
          shipment
        );

      const progress =
        calculateParcelProgress(
          shipment
        );

      setParcelPosition(position);
      setLiveProgress(progress);
    };

    updateTracking();

    const interval =
      setInterval(
        updateTracking,
        1000
      );

    return () => {
      clearInterval(interval);
    };
  }, [shipment]);

  // ===================================================
  // MAP DATA
  // ===================================================

  const startCoordinates =
    getCityCoordinates(
      shipment?.sender?.city
    );

  const destinationCoordinates =
    getCityCoordinates(
      shipment?.receiver?.city
    );

  const hasMapCoordinates =
    startCoordinates &&
    destinationCoordinates &&
    parcelPosition;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="track-page">

      {/* HEADER */}

      <header className="track-header">

        <Link
          to="/home"
          className="track-back-button"
        >
          ←
        </Link>

        <div>
          <h1>
            Track Parcel
          </h1>

          <p>
            Find your parcel's current location
          </p>
        </div>

      </header>

      {/* INTRODUCTION */}

      <section className="track-introduction">

        <h2>
          Where is your parcel?
        </h2>

        <p>
          Enter your tracking number below
          to see the latest shipment
          information.
        </p>

      </section>

      {/* SEARCH */}

      <section className="tracking-search-card">

        <form
          className="tracking-search-form"
          onSubmit={handleTrack}
        >

          <div className="tracking-input-wrapper">

            <span>
              🔎
            </span>

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(
                  e.target.value
                )
              }
              placeholder="Enter tracking number"
              aria-label="Tracking number"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Track Parcel"}
          </button>

        </form>

        <p className="tracking-example">
          Enter the tracking number generated
          when you created your shipment.
        </p>

      </section>

      {/* ERROR */}

      {error && (
        <div className="tracking-error">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && !shipment && (
        <div className="tracking-loading">
          Searching for your shipment...
        </div>
      )}

      {/* SHIPMENT RESULTS */}

      {shipment && (
        <section className="shipment-results">

          {/* STATUS CARD */}

          <div className="shipment-status-card">

            <div>

              <span className="status-label">
                Current Status
              </span>

              <h2>
                {shipment.status}
              </h2>

              <p>
                Tracking Number:{" "}
                <strong>
                  {shipment.trackingNumber}
                </strong>
              </p>

            </div>

            <div className="status-icon">
              🚚
            </div>

          </div>

          {/* LIVE MAP */}

          <div className="shipment-card tracking-map-card">

            <div className="card-title">

              <div className="card-title-icon">
                🗺️
              </div>

              <div>

                <h3>
                  Live Shipment Location
                </h3>

                <p>
                  Your parcel's estimated
                  position along the route
                </p>

              </div>

            </div>

            {hasMapCoordinates ? (

              <div className="tracking-map">

                <MapContainer
                  center={parcelPosition}
                  zoom={10}
                  scrollWheelZoom={true}
                  className="parcel-map"
                >

                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapViewController
                    start={startCoordinates}
                    destination={
                      destinationCoordinates
                    }
                    parcelPosition={
                      parcelPosition
                    }
                  />

                  {/* ROUTE */}

                  <Polyline
                    positions={[
                      startCoordinates,
                      destinationCoordinates,
                    ]}
                    pathOptions={{
                      color: "#3028c9",
                      weight: 4,
                      opacity: 0.65,
                    }}
                  />

                  {/* START */}

                  <Marker
                    position={
                      startCoordinates
                    }
                    icon={startIcon}
                  >

                    <Popup>

                      <strong>
                        Shipment Origin
                      </strong>

                      <br />

                      {shipment.sender?.city}

                    </Popup>

                  </Marker>

                  {/* DESTINATION */}

                  <Marker
                    position={
                      destinationCoordinates
                    }
                    icon={
                      destinationIcon
                    }
                  >

                    <Popup>

                      <strong>
                        Delivery Destination
                      </strong>

                      <br />

                      {shipment.receiver?.city}

                    </Popup>

                  </Marker>

                  {/* MOVING PARCEL */}

                  <Marker
                    position={
                      parcelPosition
                    }
                    icon={parcelIcon}
                  >

                    <Popup>

                      <strong>
                        Parcel Location
                      </strong>

                      <br />

                      {shipment.status}

                      <br />

                      Progress:{" "}
                      {liveProgress}%

                    </Popup>

                  </Marker>

                </MapContainer>

              </div>

            ) : (

              <div className="map-unavailable">

                <div>
                  🗺️
                </div>

                <strong>
                  Map location unavailable
                </strong>

                <p>
                  We currently don't have
                  map coordinates for{" "}
                  {shipment.sender?.city}{" "}
                  to{" "}
                  {shipment.receiver?.city}.
                </p>

              </div>

            )}

            {/* MAP LEGEND */}

            {hasMapCoordinates && (
              <div className="map-legend">

                <div>

                  <span className="legend-dot origin"></span>

                  <span>
                    {shipment.sender?.city}
                  </span>

                </div>

                <div>

                  <span className="legend-dot parcel"></span>

                  <span>
                    Parcel
                  </span>

                </div>

                <div>

                  <span className="legend-dot destination"></span>

                  <span>
                    {shipment.receiver?.city}
                  </span>

                </div>

              </div>
            )}

          </div>

          {/* PROGRESS */}

          <div className="shipment-card">

            <div className="card-title">

              <div className="card-title-icon">
                📊
              </div>

              <div>

                <h3>
                  Delivery Progress
                </h3>

                <p>
                  Current shipment progress
                </p>

              </div>

            </div>

            <div className="progress-container">

              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={
                  liveProgress
                }
                aria-valuemin="0"
                aria-valuemax="100"
              >

                <div
                  className="progress-fill"
                  style={{
                    width: `${liveProgress}%`,
                  }}
                ></div>

              </div>

              <div className="progress-labels">

                <span>
                  Picked Up
                </span>

                <strong>
                  {liveProgress}%
                </strong>

                <span>
                  Delivered
                </span>

              </div>

            </div>

          </div>

          {/* ROUTE */}

          <div className="shipment-card">

            <div className="card-title">

              <div className="card-title-icon">
                📍
              </div>

              <div>

                <h3>
                  Shipment Route
                </h3>

                <p>
                  Origin and destination
                </p>

              </div>

            </div>

            <div className="route-container">

              <div className="route-point">

                <div className="route-dot">
                  ●
                </div>

                <div>

                  <span>
                    From
                  </span>

                  <strong>
                    {shipment.sender?.city}
                  </strong>

                </div>

              </div>

              <div className="route-line"></div>

              <div className="route-point">

                <div className="route-dot destination">
                  ●
                </div>

                <div>

                  <span>
                    To
                  </span>

                  <strong>
                    {shipment.receiver?.city}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* PACKAGE INFORMATION */}

          <div className="shipment-card">

            <div className="card-title">

              <div className="card-title-icon">
                📦
              </div>

              <div>

                <h3>
                  Package Information
                </h3>

                <p>
                  Shipment details
                </p>

              </div>

            </div>

            <div className="package-grid">

              <div className="package-item">

                <span>
                  Package Type
                </span>

                <strong>
                  {shipment.packageInfo?.type ||
                    "N/A"}
                </strong>

              </div>

              <div className="package-item">

                <span>
                  Weight
                </span>

                <strong>
                  {shipment.packageInfo?.weight
                    ? `${shipment.packageInfo.weight} kg`
                    : "N/A"}
                </strong>

              </div>

            </div>

          </div>

          {/* DELIVERY ESTIMATE */}

          <div className="delivery-estimate">

            <div className="estimate-icon">
              📅
            </div>

            <div>

              <span>
                Estimated Delivery
              </span>

              <strong>
                {shipment.estimatedDelivery
                  ? new Date(
                      shipment.estimatedDelivery
                    ).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Not available"}
              </strong>

            </div>

          </div>

          {/* TIMELINE */}

          <div className="shipment-card">

            <div className="card-title">

              <div className="card-title-icon">
                🕐
              </div>

              <div>

                <h3>
                  Tracking Timeline
                </h3>

                <p>
                  Shipment history
                </p>

              </div>

            </div>

            <div className="timeline">

              {shipment.timeline &&
                shipment.timeline.length > 0 &&
                shipment.timeline.map(
                  (event, index) => (

                    <div
                      className={
                        event.completed
                          ? "timeline-item completed"
                          : "timeline-item"
                      }
                      key={index}
                    >

                      <div className="timeline-marker">

                        {event.completed
                          ? "✓"
                          : ""}

                      </div>

                      <div className="timeline-content">

                        <strong>
                          {event.title}
                        </strong>

                        <span>
                          {event.location}
                        </span>

                        <small>
                          {event.date}

                          {event.time &&
                            ` • ${event.time}`}
                        </small>

                      </div>

                    </div>
                  )
                )}

              {(!shipment.timeline ||
                shipment.timeline.length === 0) && (
                <p>
                  No tracking timeline is
                  available yet.
                </p>
              )}

            </div>

          </div>

        </section>
      )}

    </main>
  );
}

export default TrackParcel;

