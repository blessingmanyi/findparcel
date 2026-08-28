import { useState } from "react";
import { Link } from "react-router-dom";
import "./PaymentMethods.css";

function PaymentMethods() {
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const savedUser =
        localStorage.getItem("findparcelUser");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "User information error:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // SELECT PAYMENT METHOD
  // =====================================================

  const selectNetwork = (selectedNetwork) => {
    setNetwork(selectedNetwork);

    setMessage("");
    setError("");

    const loggedInUser =
      getLoggedInUser();

    if (loggedInUser) {
      setEmail(
        loggedInUser.email || ""
      );

      setName(
        loggedInUser.fullName || ""
      );
    }
  };

  // =====================================================
  // MAKE PAYMENT
  // =====================================================

  const handlePayment = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!network) {
      setError(
        "Please select MTN Mobile Money or Orange Money."
      );
      return;
    }

    if (!phoneNumber.trim()) {
      setError(
        "Please enter your Mobile Money phone number."
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // STEP 1 — CREATE PAYMENT
      // =================================================

      const paymentResponse =
        await fetch(
          "https://findparcel.onrender.com/api/payments/mobile-money",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              amount: Number(amount),

              phoneNumber:
                phoneNumber.trim(),

              network,

              email:
                email.trim(),

              name:
                name.trim() ||
                "FindParcel Customer",
            }),
          }
        );

      const paymentData =
        await paymentResponse.json();

      console.log(
        "Flutterwave payment response:",
        paymentData
      );

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.message ||
            "Unable to start payment."
        );
      }

      // =================================================
      // GET TRANSACTION INFORMATION
      // =================================================

      const transactionId =
        paymentData.transactionId;

      const transactionReference =
        paymentData.transactionReference;

      if (!transactionId) {
        throw new Error(
          "Flutterwave did not return a transaction ID."
        );
      }

      // =================================================
      // INFORM CUSTOMER
      // =================================================

      setMessage(
        "Payment request created. Please approve the Mobile Money payment on your phone."
      );

      // =================================================
      // WAIT FOR PAYMENT AUTHORIZATION
      // =================================================

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 5000)
      );

      // =================================================
      // VERIFY PAYMENT
      // =================================================

      const verifyResponse =
        await fetch(
          "https://findparcel.onrender.com/api/payments/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transactionId,

              expectedAmount:
                Number(amount),

              transactionReference,
            }),
          }
        );

      const verifyData =
        await verifyResponse.json();

      console.log(
        "Payment verification response:",
        verifyData
      );

      if (!verifyResponse.ok) {
        throw new Error(
          verifyData.message ||
            "Payment could not be verified."
        );
      }

      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      if (
        verifyData.paymentSuccessful
      ) {
        setMessage(
          `Payment successful! Your payment of ${Number(
            amount
          ).toLocaleString()} XAF has been confirmed.`
        );

        // Clear payment fields
        setPhoneNumber("");
        setAmount("");

        return;
      }

      throw new Error(
        "Payment was not successful."
      );

    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error.message ||
          "Unable to complete payment."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="payment-methods-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="payment-methods-header">

        <Link
          to="/profile"
          className="payment-methods-back-button"
        >
          ←
        </Link>

        <h1>
          Payment Methods
        </h1>

        <div className="payment-methods-header-spacer"></div>

      </header>


      {/* =================================================
          INTRO
      ================================================= */}

      <section className="payment-methods-intro">

        <div className="payment-methods-main-icon">
          💳
        </div>

        <h2>
          Mobile Money
        </h2>

        <p>
          Pay securely for your FindParcel
          shipments using Mobile Money.
        </p>

      </section>


      {/* =================================================
          PAYMENT OPTIONS
      ================================================= */}

      <section className="payment-options">

        {/* =================================================
            MTN MOBILE MONEY
        ================================================= */}

        <button
          type="button"
          className={`payment-method-card ${
            network === "mtn"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            selectNetwork("mtn")
          }
        >

          <div className="payment-method-logo mtn-logo">
            MTN
          </div>

          <div className="payment-method-info">

            <h3>
              MTN Mobile Money
            </h3>

            <p>
              Pay using your MTN Mobile Money
              account.
            </p>

          </div>

          <span className="payment-method-status">

            {network === "mtn"
              ? "Selected"
              : "Select"}

          </span>

        </button>


        {/* =================================================
            ORANGE MONEY
        ================================================= */}

        <button
          type="button"
          className={`payment-method-card ${
            network === "orange"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            selectNetwork("orange")
          }
        >

          <div className="payment-method-logo orange-logo">
            Orange
          </div>

          <div className="payment-method-info">

            <h3>
              Orange Money
            </h3>

            <p>
              Pay using your Orange Money
              account.
            </p>

          </div>

          <span className="payment-method-status">

            {network === "orange"
              ? "Selected"
              : "Select"}

          </span>

        </button>

      </section>


      {/* =================================================
          PAYMENT FORM
      ================================================= */}

      {network && (

        <section className="payment-form-section">

          <h2>

            {network === "mtn"
              ? "MTN Mobile Money Payment"
              : "Orange Money Payment"}

          </h2>

          <p className="payment-form-description">

            Enter your details below to
            continue.

          </p>


          <form
            onSubmit={handlePayment}
            className="payment-form"
          >

            {/* =================================================
                FULL NAME
            ================================================= */}

            <label>

              Full Name

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Your full name"
              />

            </label>


            {/* =================================================
                EMAIL
            ================================================= */}

            <label>

              Email Address

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                required
              />

            </label>


            {/* =================================================
                PHONE NUMBER
            ================================================= */}

            <label>

              Mobile Money Phone Number

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(
                    event.target.value
                  )
                }
                placeholder="6XXXXXXXX"
                inputMode="numeric"
                required
              />

            </label>


            {/* =================================================
                AMOUNT
            ================================================= */}

            <label>

              Amount (XAF)

              <input
                type="number"
                min="100"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="Enter amount"
                required
              />

            </label>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

              <div className="payment-error">

                {error}

              </div>

            )}


            {/* =================================================
                SUCCESS / STATUS MESSAGE
            ================================================= */}

            {message && (

              <div className="payment-success">

                {message}

              </div>

            )}


            {/* =================================================
                PAYMENT BUTTON
            ================================================= */}

            <button
              type="submit"
              className="payment-submit-button"
              disabled={loading}
            >

              {loading
                ? "Processing..."
                : `Pay with ${
                    network === "mtn"
                      ? "MTN Mobile Money"
                      : "Orange Money"
                  }`}

            </button>

          </form>

        </section>

      )}


      {/* =================================================
          SECURITY
      ================================================= */}

      <section className="payment-security-card">

        <div className="payment-security-icon">
          🔒
        </div>

        <div>

          <h3>
            Secure Payments
          </h3>

          <p>
            Your payment is securely processed
            through Flutterwave. FindParcel does
            not store your Mobile Money PIN.
          </p>

        </div>

      </section>


      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="payment-info-section">

        <h3>
          How it works
        </h3>


        <div className="payment-step">

          <span>
            1
          </span>

          <p>
            Choose MTN Mobile Money or
            Orange Money.
          </p>

        </div>


        <div className="payment-step">

          <span>
            2
          </span>

          <p>
            Enter your Mobile Money phone
            number and payment amount.
          </p>

        </div>


        <div className="payment-step">

          <span>
            3
          </span>

          <p>
            Confirm the payment on your
            phone.
          </p>

        </div>


        <div className="payment-step">

          <span>
            4
          </span>

          <p>
            FindParcel verifies the payment
            before confirming it.
          </p>

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="payment-methods-footer">

        <p>
          Payments powered by Flutterwave
        </p>

      </footer>

    </main>
  );
}

export default PaymentMethods;