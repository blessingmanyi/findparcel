
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // PRODUCTION BACKEND
  // =====================================================

  const API_BASE_URL =
    "https://findparcel.onrender.com";

  // =====================================================
  // HANDLE REGISTRATION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // =====================================================
    // CHECK FULL NAME
    // =====================================================

    if (!cleanFullName) {
      setError("Please enter your full name.");
      return;
    }

    // =====================================================
    // CHECK EMAIL
    // =====================================================

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    // =====================================================
    // CHECK PASSWORD
    // =====================================================

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    // =====================================================
    // REGISTER THROUGH BACKEND
    // =====================================================

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: cleanFullName,
            email: cleanEmail,
            password,
          }),
        }
      );

      // =====================================================
      // READ RESPONSE AS TEXT FIRST
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
          "The registration server returned an invalid response. Please try again."
        );
      }

      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create account."
        );
      }

      // =====================================================
      // ACCOUNT CREATED
      // VERIFICATION CODE SENT
      // =====================================================

      alert(
        "Account created successfully! A verification code has been sent to your email."
      );

      // =====================================================
      // GO TO EMAIL VERIFICATION
      // =====================================================

      navigate("/verify-email", {
        state: {
          email: data.email || cleanEmail,
        },
      });

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="register-page">

      <div className="register-container">

        {/* =========================
            LOGO
        ========================= */}

        <div className="register-logo">
          <img
            src="/findparcel-icon.png"
            alt="FindParcel"
          />
        </div>


        {/* =========================
            TITLE
        ========================= */}

        <h1>
          Create Account
        </h1>

        <p className="register-subtitle">
          Create your FindParcel account
        </p>


        {/* =========================
            REGISTRATION FORM
        ========================= */}

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              FULL NAME
          ========================= */}

          <div className="register-form-group">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

          </div>


          {/* =========================
              EMAIL
          ========================= */}

          <div className="register-form-group">

            <label htmlFor="registerEmail">
              Email Address
            </label>

            <input
              type="email"
              id="registerEmail"
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
              PASSWORD
          ========================= */}

          <div className="register-form-group">

            <label htmlFor="registerPassword">
              Password
            </label>

            <input
              type="password"
              id="registerPassword"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />

          </div>


          {/* =========================
              CONFIRM PASSWORD
          ========================= */}

          <div className="register-form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />

          </div>


          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          {/* =========================
              SUBMIT
          ========================= */}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        {/* =========================
            LOGIN
        ========================= */}

        <p className="register-login-text">

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </main>
  );
}

export default Register;

