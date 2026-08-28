import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ShipmentProvider } from "./context/ShipmentContext";

// =========================================
// APPLY SAVED THEME BEFORE APP LOADS
// =========================================

const savedTheme =
  localStorage.getItem("findparcelTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
} else {
  document.body.classList.remove("dark-mode");
}

// =========================================
// RENDER APP
// =========================================

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <ShipmentProvider>
      <App />
    </ShipmentProvider>
  </React.StrictMode>
);

// =========================================
// REGISTER FINDPARCEL SERVICE WORKER
// =========================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(
        `${process.env.PUBLIC_URL}/service-worker.js`
      )
      .then((registration) => {
        console.log(
          "FindParcel service worker registered:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error(
          "FindParcel service worker registration failed:",
          error
        );
      });
  });
}