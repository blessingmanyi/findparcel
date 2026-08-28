import { useState } from "react";
import { Link } from "react-router-dom";
import "./RateCalculator.css";

function RateCalculator() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [packageType, setPackageType] = useState("");
  const [weight, setWeight] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState("standard");

  const [price, setPrice] = useState(null);
  const [error, setError] = useState("");

  const calculatePrice = () => {
    setError("");

    if (!fromCity || !toCity || !packageType || !weight) {
      setError("Please fill in all shipment details.");
      return;
    }

    if (Number(weight) <= 0) {
      setError("Weight must be greater than 0 kg.");
      return;
    }

    if (fromCity === toCity) {
      setError("Pickup and delivery cities cannot be the same.");
      return;
    }

    // Base prices
    let basePrice = 3000;

    // Package type
    if (packageType === "document") {
      basePrice = 2500;
    } else if (packageType === "small") {
      basePrice = 3000;
    } else if (packageType === "medium") {
      basePrice = 4000;
    } else if (packageType === "large") {
      basePrice = 5000;
    }

    // Additional weight charge
    const weightValue = Number(weight);

    if (weightValue > 1) {
      basePrice += Math.ceil(weightValue - 1) * 500;
    }

    // Express delivery
    if (deliverySpeed === "express") {
      basePrice += 2000;
    }

    const serviceFee = 500;

    const totalPrice = basePrice + serviceFee;

    setPrice({
      basePrice,
      serviceFee,
      totalPrice,
    });
  };

  return (
    <main className="rate-page">

      {/* Header */}
      <header className="rate-header">

        <Link to="/home" className="rate-back-button">
          ←
        </Link>

        <div>
          <h1>Rate Calculator</h1>
          <p>Calculate your shipping cost</p>
        </div>

      </header>


      {/* Introduction */}
      <section className="rate-introduction">

        <h2>Calculate Shipping Cost</h2>

        <p>
          Enter your shipment details to get an
          estimated delivery price.
        </p>

      </section>


      {/* Calculator */}
      <section className="calculator-card">

        <div className="calculator-heading">

          <div className="calculator-icon">
            💰
          </div>

          <div>
            <h3>Shipment Details</h3>
            <p>Provide information about your parcel</p>
          </div>

        </div>


        {/* Shipment Details */}
        <div className="calculator-grid">

          {/* Pickup City */}
          <div className="rate-form-group">

            <label htmlFor="fromCity">
              Pickup City
            </label>

            <select
              id="fromCity"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
            >

              <option value="">
                Select pickup city
              </option>

              <option value="douala">
                Douala
              </option>

              <option value="yaounde">
                Yaoundé
              </option>

              <option value="buea">
                Buea
              </option>

              <option value="bamenda">
                Bamenda
              </option>

              <option value="limbe">
                Limbe
              </option>

            </select>

          </div>


          {/* Delivery City */}
          <div className="rate-form-group">

            <label htmlFor="toCity">
              Delivery City
            </label>

            <select
              id="toCity"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
            >

              <option value="">
                Select delivery city
              </option>

              <option value="douala">
                Douala
              </option>

              <option value="yaounde">
                Yaoundé
              </option>

              <option value="buea">
                Buea
              </option>

              <option value="bamenda">
                Bamenda
              </option>

              <option value="limbe">
                Limbe
              </option>

            </select>

          </div>


          {/* Package Type */}
          <div className="rate-form-group">

            <label htmlFor="ratePackageType">
              Package Type
            </label>

            <select
              id="ratePackageType"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
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


          {/* Weight */}
          <div className="rate-form-group">

            <label htmlFor="rateWeight">
              Weight
            </label>

            <div className="input-with-unit">

              <input
                type="number"
                id="rateWeight"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
              />

              <span>kg</span>

            </div>

          </div>

        </div>


        {/* Error Message */}
        {error && (
          <p className="calculator-error">
            {error}
          </p>
        )}


        {/* Delivery Speed */}
        <div className="speed-section">

          <h3>Delivery Speed</h3>

          <div className="speed-options">

            <label className="speed-option">

              <input
                type="radio"
                name="deliverySpeed"
                value="standard"
                checked={deliverySpeed === "standard"}
                onChange={(e) =>
                  setDeliverySpeed(e.target.value)
                }
              />

              <div className="speed-content">

                <strong>
                  Standard
                </strong>

                <span>
                  2 - 4 business days
                </span>

              </div>

              <b>
                +0 FCFA
              </b>

            </label>


            <label className="speed-option">

              <input
                type="radio"
                name="deliverySpeed"
                value="express"
                checked={deliverySpeed === "express"}
                onChange={(e) =>
                  setDeliverySpeed(e.target.value)
                }
              />

              <div className="speed-content">

                <strong>
                  Express
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

        </div>


        {/* Calculate */}
        <button
          type="button"
          className="calculate-button"
          onClick={calculatePrice}
        >
          Calculate Price
        </button>

      </section>


      {/* Price Result */}
      {price && (
        <section className="price-result">

          <div className="price-result-top">

            <div>

              <span>
                Estimated Shipping Cost
              </span>

              <h2>
                {price.totalPrice.toLocaleString()} FCFA
              </h2>

            </div>

            <div className="price-icon">
              💰
            </div>

          </div>


          <div className="price-details">

            <div>
              <span>Shipping cost</span>

              <strong>
                {price.basePrice.toLocaleString()} FCFA
              </strong>
            </div>

            <div>
              <span>Service fee</span>

              <strong>
                {price.serviceFee.toLocaleString()} FCFA
              </strong>
            </div>

          </div>


          <Link
            to="/send-parcel"
            className="continue-booking-button"
          >
            Continue to Booking →
          </Link>

        </section>
      )}

    </main>
  );
}

export default RateCalculator;