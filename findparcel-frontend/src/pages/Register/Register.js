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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
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

    try {
      setLoading(true);

      const response = await fetch(
        "https://findparcel.onrender.com/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create account."
        );
      }

      // ==========================================
      // ACCOUNT CREATED
      // VERIFICATION CODE SENT TO EMAIL
      // ==========================================

      alert(
        "Account created successfully! A verification code has been sent to your email."
      );

      // ==========================================
      // GO TO VERIFICATION PAGE
      // ==========================================

      navigate("/verify-email", {
        state: {
          email: data.email || email,
        },
      });

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create account."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-container">

        <div className="register-logo">
          📦
        </div>

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Create your FindParcel account
        </p>


        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          {/* Full Name */}
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
              required
            />

          </div>


          {/* Email */}
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
              required
            />

          </div>


          {/* Password */}
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
              required
            />

          </div>


          {/* Confirm Password */}
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
              required
            />

          </div>


          {/* Error */}
          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          {/* Submit */}
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