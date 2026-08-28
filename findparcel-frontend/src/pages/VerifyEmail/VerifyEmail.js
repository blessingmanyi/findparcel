
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VerifyEmail.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [verificationCode, setVerificationCode] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // BACKEND API URL
  // =====================================================

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://findparcel.onrender.com";

  // =====================================================
  // HANDLE EMAIL VERIFICATION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // =====================================================
    // CHECK FIELDS
    // =====================================================

    if (!email.trim() || !verificationCode) {
      setError(
        "Please enter your email and verification code."
      );
      return;
    }

    // =====================================================
    // CHECK VERIFICATION CODE
    // =====================================================

    if (!/^\d{6}$/.test(verificationCode)) {
      setError(
        "Verification code must contain exactly 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // VERIFY EMAIL THROUGH BACKEND
      // =====================================================

      const response = await fetch(
        `${API_URL}/api/auth/verify-email`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            verificationCode,
          }),
        }
      );

      // =====================================================
      // GET RESPONSE AS TEXT FIRST
      // =====================================================

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Backend returned non-JSON response:",
          responseText
        );

        throw new Error(
          "Unable to connect to the verification service. Please make sure your backend is running."
        );
      }

      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Verification failed."
        );
      }

      // =====================================================
      // VERIFICATION SUCCESSFUL
      // =====================================================

      alert(
        "Email verified successfully! You can now login."
      );

      // =====================================================
      // GO TO LOGIN
      // =====================================================

      navigate("/login");

    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setError(
        error.message ||
          "Unable to verify your email."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="verify-page">

      <div className="verify-container">

        {/* =========================
            LOGO
        ========================= */}

        <div className="verify-logo">
          📧
        </div>

        {/* =========================
            TITLE
        ========================= */}

        <h1>
          Verify Your Email
        </h1>

        <p className="verify-subtitle">
          We sent a 6-digit verification code
          to your email address.
        </p>

        {/* =========================
            VERIFICATION FORM
        ========================= */}

        <form
          className="verify-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              EMAIL
          ========================= */}

          <div className="verify-form-group">

            <label htmlFor="verifyEmail">
              Email Address
            </label>

            <input
              type="email"
              id="verifyEmail"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>

          {/* =========================
              VERIFICATION CODE
          ========================= */}

          <div className="verify-form-group">

            <label htmlFor="verificationCode">
              Verification Code
            </label>

            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit code"
              inputMode="numeric"
              maxLength="6"
              autoComplete="one-time-code"
              required
            />

          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="verify-error">
              {error}
            </div>
          )}

          {/* =========================
              VERIFY BUTTON
          ========================= */}

          <button
            type="submit"
            className="verify-button"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

      </div>

    </main>
  );
}

export default VerifyEmail;
