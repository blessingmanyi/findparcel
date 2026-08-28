import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    // =====================================================
    // CHECK FIELDS
    // =====================================================

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    // =====================================================
    // LOGIN THROUGH BACKEND
    // =====================================================

    try {
      setLoading(true);

      const response = await fetch(
        "http://findparcel.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password,
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
          "Unable to connect to the login service. Please make sure your backend is running."
        );
      }

      // =====================================================
      // BACKEND ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      // =====================================================
      // GET USER
      // =====================================================

      const user = data.user;

      if (!user) {
        throw new Error(
          "Login successful, but user information was not returned."
        );
      }

      // =====================================================
      // GET USER ID
      // =====================================================

      const userId =
        user._id ||
        user.id ||
        user.userId;

      if (!userId) {
        console.error(
          "User returned from backend:",
          user
        );

        throw new Error(
          "Login successful, but your customer ID was not returned by the server."
        );
      }

      // =====================================================
      // SAVE USER INFORMATION
      // =====================================================

      const loggedInUser = {
        ...user,

        _id: userId,

        id: userId,
      };

      localStorage.setItem(
        "findparcelUser",
        JSON.stringify(loggedInUser)
      );

      // =====================================================
      // ADMIN LOGIN
      // =====================================================

      if (user.role === "admin") {
        navigate("/admin-shipments");

        return;
      }

      // =====================================================
      // CUSTOMER LOGIN
      // =====================================================

      navigate("/home");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-container">

        {/* =========================
            LOGO
        ========================= */}

        <div className="login-logo">
          📦
        </div>


        {/* =========================
            TITLE
        ========================= */}

        <h1>
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Login to your FindParcel account
        </p>


        {/* =========================
            LOGIN FORM
        ========================= */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              EMAIL
          ========================= */}

          <div className="login-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
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

          <div className="login-form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

          </div>


          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* =========================
              LOGIN BUTTON
          ========================= */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* =========================
            REGISTER
        ========================= */}

        <p className="login-register-text">

          Don't have an account?{" "}

          <Link to="/register">
            Create an account
          </Link>

        </p>

      </div>

    </main>
  );
}

export default Login;