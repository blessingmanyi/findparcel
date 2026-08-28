import { useState } from "react";
import { Link } from "react-router-dom";
import "./SendParcel.css";

function SendParcel() {
  const [sender, setSender] = useState({
    name: "",
    phone: "",
    email: "",
    idNumber: "",
    city: "",
    address: "",
  });

  const [receiver, setReceiver] = useState({
    name: "",
    phone: "",
    email: "",
    idNumber: "",
    city: "",
    address: "",
  });

  const [packageInfo, setPackageInfo] = useState({
    type: "",
    weight: "",
    description: "",
  });

  const [deliverySpeed, setDeliverySpeed] =
    useState("standard");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] =
    useState("");

  // =========================
  // HANDLE SENDER
  // =========================
  const handleSenderChange = (e) => {
    const { name, value } = e.target;

    setSender((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE RECEIVER
  // =========================
  const handleReceiverChange = (e) => {
    const { name, value } = e.target;

    setReceiver((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // HANDLE PACKAGE
  // =========================
  const handlePackageChange = (e) => {
    const { name, value } = e.target;

    setPackageInfo((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // CALCULATE SHIPPING
  // =========================
  const calculateShipping = () => {
    let price = 3000;

    if (packageInfo.type === "document") {
      price = 2500;
    }

    if (packageInfo.type === "small") {
      price = 3000;
    }

    if (packageInfo.type === "medium") {
      price = 4000;
    }

    if (packageInfo.type === "large") {
      price = 5000;
    }

    const weight = Number(packageInfo.weight);

    if (weight > 1) {
      price += Math.ceil(weight - 1) * 500;
    }

    if (deliverySpeed === "express") {
      price += 2000;
    }

    // Service fee
    return price + 500;
  };

  // =========================
  // CREATE SHIPMENT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitted(false);
    setTrackingNumber("");

    // =========================
    // GET LOGGED-IN CUSTOMER
    // =========================
    const savedUser =
      localStorage.getItem("findparcelUser");

    if (!savedUser) {
      setError(
        "You must be logged in to create a shipment."
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      setError(
        "Your login session is invalid. Please log in again."
      );
      return;
    }

    const customerId =
      user?._id ||
      user?.id ||
      user?.userId;

    if (!customerId) {
      setError(
        "Unable to identify your customer account. Please log in again."
      );
      return;
    }

    // =========================
    // VALIDATE SENDER
    // =========================
    if (
      !sender.name ||
      !sender.phone ||
      !sender.email ||
      !sender.idNumber ||
      !sender.city ||
      !sender.address
    ) {
      setError(
        "Please complete all sender information."
      );
      return;
    }

    // =========================
    // VALIDATE RECEIVER
    // =========================
    if (
      !receiver.name ||
      !receiver.phone ||
      !receiver.email ||
      !receiver.idNumber ||
      !receiver.city ||
      !receiver.address
    ) {
      setError(
        "Please complete all receiver information."
      );
      return;
    }

    // =========================
    // VALIDATE PACKAGE
    // =========================
    if (
      !packageInfo.type ||
      !packageInfo.weight ||
      !packageInfo.description
    ) {
      setError(
        "Please complete all package information."
      );
      return;
    }

    if (Number(packageInfo.weight) <= 0) {
      setError(
        "Package weight must be greater than 0 kg."
      );
      return;
    }

    // =========================
    // CHECK DIFFERENT CITIES
    // =========================
    if (sender.city === receiver.city) {
      setError(
        "Sender and receiver cities cannot be the same."
      );
      return;
    }

    const shippingPrice = calculateShipping();

    try {
      // =========================
      // DATA SENT TO BACKEND
      // =========================
      const shipmentData = {
        customerId,

        sender,

        receiver,

        packageInfo: {
          type: packageInfo.type,
          weight: Number(packageInfo.weight),
          description: packageInfo.description,
        },

        deliverySpeed,

        shippingPrice,
      };

      const response = await fetch(
        "https://findparcel.onrender.com//api/shipments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(shipmentData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create shipment."
        );
      }

      console.log(
        "Shipment created:",
        data.shipment
      );

      // =========================
      // SAVE TRACKING NUMBER
      // =========================
      setTrackingNumber(
        data.shipment.trackingNumber
      );

      setSubmitted(true);

      // =========================
      // SUCCESS MESSAGE
      // =========================
      alert(
        `Shipment created successfully!\n\nYour tracking number is: ${data.shipment.trackingNumber}`
      );

      // =========================
      // RESET FORM
      // =========================
      setSender({
        name: "",
        phone: "",
        email: "",
        idNumber: "",
        city: "",
        address: "",
      });

      setReceiver({
        name: "",
        phone: "",
        email: "",
        idNumber: "",
        city: "",
        address: "",
      });

      setPackageInfo({
        type: "",
        weight: "",
        description: "",
      });

      setDeliverySpeed("standard");
    } catch (error) {
      console.error(
        "Shipment creation error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while creating the shipment."
      );
    }
  };

  const shippingPrice = calculateShipping();

  return (
    <main className="send-page">

      {/* =========================
          HEADER
      ========================= */}
      <header className="send-header">

        <Link
          to="/home"
          className="send-back-button"
        >
          ←
        </Link>

        <div>
          <h1>Send a Parcel</h1>

          <p>
            Create a new shipment
          </p>
        </div>

      </header>


      {/* =========================
          INTRODUCTION
      ========================= */}
      <section className="send-introduction">

        <h2>Book a Shipment</h2>

        <p>
          Enter the sender, receiver and package
          information below.
        </p>

      </section>


      <form
        className="send-form"
        onSubmit={handleSubmit}
      >

        {/* =========================
            SENDER
        ========================= */}
        <section className="send-card">

          <div className="send-card-heading">

            <div className="send-card-icon">
              👤
            </div>

            <div>
              <h3>
                Sender Information
              </h3>

              <p>
                Who is sending the parcel?
              </p>
            </div>

          </div>


          <div className="send-form-grid">

            <div className="send-form-group">

              <label htmlFor="sender-name">
                Full Name
              </label>

              <input
                type="text"
                id="sender-name"
                name="name"
                value={sender.name}
                onChange={handleSenderChange}
                placeholder="Enter sender name"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="sender-phone">
                Phone Number
              </label>

              <input
                type="tel"
                id="sender-phone"
                name="phone"
                value={sender.phone}
                onChange={handleSenderChange}
                placeholder="Enter phone number"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="sender-email">
                Email Address
              </label>

              <input
                type="email"
                id="sender-email"
                name="email"
                value={sender.email}
                onChange={handleSenderChange}
                placeholder="Enter email address"
              />

            </div>


            {/* =========================
                SENDER ID NUMBER
            ========================= */}
            <div className="send-form-group">

              <label htmlFor="sender-id-number">
                ID Number
              </label>

              <input
                type="text"
                id="sender-id-number"
                name="idNumber"
                value={sender.idNumber}
                onChange={handleSenderChange}
                placeholder="Enter sender ID number"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="sender-city">
                City
              </label>

              <select
                id="sender-city"
                name="city"
                value={sender.city}
                onChange={handleSenderChange}
              >

                <option value="">
                  Select city
                </option>

                <option value="Douala">
                  Douala
                </option>

                <option value="Yaoundé">
                  Yaoundé
                </option>

                <option value="Buea">
                  Buea
                </option>

                <option value="Bamenda">
                  Bamenda
                </option>

                <option value="Limbe">
                  Limbe
                </option>

              </select>

            </div>


            <div className="send-form-group full-width">

              <label htmlFor="sender-address">
                Address
              </label>

              <input
                type="text"
                id="sender-address"
                name="address"
                value={sender.address}
                onChange={handleSenderChange}
                placeholder="Enter complete address"
              />

            </div>

          </div>

        </section>


        {/* =========================
            RECEIVER
        ========================= */}
        <section className="send-card">

          <div className="send-card-heading">

            <div className="send-card-icon">
              📍
            </div>

            <div>
              <h3>
                Receiver Information
              </h3>

              <p>
                Who will receive the parcel?
              </p>
            </div>

          </div>


          <div className="send-form-grid">

            <div className="send-form-group">

              <label htmlFor="receiver-name">
                Full Name
              </label>

              <input
                type="text"
                id="receiver-name"
                name="name"
                value={receiver.name}
                onChange={handleReceiverChange}
                placeholder="Enter receiver name"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="receiver-phone">
                Phone Number
              </label>

              <input
                type="tel"
                id="receiver-phone"
                name="phone"
                value={receiver.phone}
                onChange={handleReceiverChange}
                placeholder="Enter phone number"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="receiver-email">
                Email Address
              </label>

              <input
                type="email"
                id="receiver-email"
                name="email"
                value={receiver.email}
                onChange={handleReceiverChange}
                placeholder="Enter email address"
              />

            </div>


            {/* =========================
                RECEIVER ID NUMBER
            ========================= */}
            <div className="send-form-group">

              <label htmlFor="receiver-id-number">
                ID Number
              </label>

              <input
                type="text"
                id="receiver-id-number"
                name="idNumber"
                value={receiver.idNumber}
                onChange={handleReceiverChange}
                placeholder="Enter receiver ID number"
              />

            </div>


            <div className="send-form-group">

              <label htmlFor="receiver-city">
                City
              </label>

              <select
                id="receiver-city"
                name="city"
                value={receiver.city}
                onChange={handleReceiverChange}
              >

                <option value="">
                  Select city
                </option>

                <option value="Douala">
                  Douala
                </option>

                <option value="Yaoundé">
                  Yaoundé
                </option>

                <option value="Buea">
                  Buea
                </option>

                <option value="Bamenda">
                  Bamenda
                </option>

                <option value="Limbe">
                  Limbe
                </option>

              </select>

            </div>


            <div className="send-form-group full-width">

              <label htmlFor="receiver-address">
                Address
              </label>

              <input
                type="text"
                id="receiver-address"
                name="address"
                value={receiver.address}
                onChange={handleReceiverChange}
                placeholder="Enter complete address"
              />

            </div>

          </div>

        </section>


        {/* =========================
            PACKAGE
        ========================= */}
        <section className="send-card">

          <div className="send-card-heading">

            <div className="send-card-icon">
              📦
            </div>

            <div>
              <h3>
                Package Information
              </h3>

              <p>
                Tell us about your parcel.
              </p>
            </div>

          </div>


          <div className="send-form-grid">

            <div className="send-form-group">

              <label htmlFor="package-type">
                Package Type
              </label>

              <select
                id="package-type"
                name="type"
                value={packageInfo.type}
                onChange={handlePackageChange}
              >

                <option value="">
                  Select package type
                </option>

                <option value="document">
                  Document
                </option>

                <option value="small">
                  Small Package
                </option>

                <option value="medium">
                  Medium Package
                </option>

                <option value="large">
                  Large Package
                </option>

              </select>

            </div>


            <div className="send-form-group">

              <label htmlFor="package-weight">
                Weight
              </label>

              <div className="send-input-unit">

                <input
                  type="number"
                  id="package-weight"
                  name="weight"
                  min="0"
                  step="0.1"
                  value={packageInfo.weight}
                  onChange={handlePackageChange}
                  placeholder="Enter weight"
                />

                <span>kg</span>

              </div>

            </div>


            <div className="send-form-group full-width">

              <label htmlFor="package-description">
                Package Description
              </label>

              <textarea
                id="package-description"
                name="description"
                value={packageInfo.description}
                onChange={handlePackageChange}
                placeholder="Describe the contents of your parcel"
                rows="4"
              />

            </div>

          </div>

        </section>


        {/* =========================
            DELIVERY
        ========================= */}
        <section className="send-card">

          <div className="send-card-heading">

            <div className="send-card-icon">
              🚚
            </div>

            <div>
              <h3>
                Delivery Option
              </h3>

              <p>
                Choose your preferred delivery speed.
              </p>
            </div>

          </div>


          <div className="delivery-options">

            <label
              className={
                deliverySpeed === "standard"
                  ? "delivery-option selected"
                  : "delivery-option"
              }
            >

              <input
                type="radio"
                name="sendDeliverySpeed"
                value="standard"
                checked={
                  deliverySpeed === "standard"
                }
                onChange={(e) =>
                  setDeliverySpeed(
                    e.target.value
                  )
                }
              />

              <div>
                <strong>
                  Standard Delivery
                </strong>

                <span>
                  2 - 4 business days
                </span>
              </div>

              <b>
                +0 FCFA
              </b>

            </label>


            <label
              className={
                deliverySpeed === "express"
                  ? "delivery-option selected"
                  : "delivery-option"
              }
            >

              <input
                type="radio"
                name="sendDeliverySpeed"
                value="express"
                checked={
                  deliverySpeed === "express"
                }
                onChange={(e) =>
                  setDeliverySpeed(
                    e.target.value
                  )
                }
              />

              <div>
                <strong>
                  Express Delivery
                </strong>

                <span>
                  1 - 2 business days
                </span>
              </div>

              <b>
                +2,000 FCFA
              </b>

            </label>

          </div>

        </section>


        {/* =========================
            ERROR
        ========================= */}
        {error && (
          <div className="send-error">
            {error}
          </div>
        )}


        {/* =========================
            SUCCESS
        ========================= */}
        {submitted && trackingNumber && (
          <div className="send-success">

            <p>
              Shipment created successfully! 🎉
            </p>

            <p>
              Your tracking number is:
            </p>

            <strong className="generated-tracking-number">
              {trackingNumber}
            </strong>

            <p>
              Save this tracking number to track
              your parcel.
            </p>

          </div>
        )}


        {/* =========================
            SHIPPING SUMMARY
        ========================= */}
        <section className="send-summary">

          <div className="summary-heading">

            <h3>
              Shipping Summary
            </h3>

            <span>
              Estimated Cost
            </span>

          </div>


          <div className="summary-row">

            <span>
              Base shipping
            </span>

            <strong>
              {(shippingPrice - 500).toLocaleString()} FCFA
            </strong>

          </div>


          <div className="summary-row">

            <span>
              Service fee
            </span>

            <strong>
              500 FCFA
            </strong>

          </div>


          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              {shippingPrice.toLocaleString()} FCFA
            </strong>

          </div>

        </section>


        {/* =========================
            SUBMIT
        ========================= */}
        <button
          type="submit"
          className="submit-shipment-button"
        >
          Create Shipment
        </button>

      </form>

    </main>
  );
}

export default SendParcel;