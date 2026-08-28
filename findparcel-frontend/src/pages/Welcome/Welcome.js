import { Link } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  return (
    <main className="welcome-page">
      <section className="welcome-content">

        <div className="welcome-logo">
          <span>📦</span>
        </div>

        <h1>FindParcel</h1>

        <p className="welcome-tagline">
          Send • Track • Receive
        </p>

        <p className="welcome-description">
          Fast, safe and reliable parcel delivery.
          <br />
          Find your parcel wherever it goes.
        </p>

        <Link to="/login" className="welcome-button">
          Get Started
        </Link>

      </section>
    </main>
  );
}

export default Welcome;