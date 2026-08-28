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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !verificationCode) {
      setError(
        "Please enter your email and verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      setError(
        "Verification code must contain exactly 6 digits."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://findparcel.onrender.com/api/auth/verify-email",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Verification failed."
        );
      }

      alert(
        "Email verified successfully! You can now login."
      );

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

        <div className="verify-logo">
          📧
        </div>

        <h1>
          Verify Your Email
        </h1>

        <p className="verify-subtitle">
          We sent a 6-digit verification code
          to your email address.
        </p>

        <form
          className="verify-form"
          onSubmit={handleSubmit}
        >

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
              required
            />

          </div>


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
              required
            />

          </div>


          {error && (
            <div className="verify-error">
              {error}
            </div>
          )}


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