import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome/Welcome";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import TrackParcel from "./pages/TrackParcel/TrackParcel";
import SendParcel from "./pages/SendParcel/SendParcel";
import RateCalculator from "./pages/RateCalculator/RateCalculator";
import MyShipments from "./pages/MyShipments/MyShipments";
import AdminShipments from "./pages/AdminShipments/AdminShipments";
import Profile from "./pages/Profile/Profile";
import Notifications from "./pages/Notifications/Notifications";
import Settings from "./pages/Settings/Settings";
import Addresses from "./pages/Addresses/Addresses";
import Help from "./pages/Help/Help";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import PaymentMethods from "./pages/PaymentMethods/PaymentMethods";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Welcome />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<Home />} />

        <Route path="/track" element={<TrackParcel />} />

        <Route
          path="/send-parcel"
          element={<SendParcel />}
        />

        <Route
          path="/rate-calculator"
          element={<RateCalculator />}
        />

        <Route
          path="/shipments"
          element={<MyShipments />}
        />
        <Route
          path="/admin-shipments"
          element={<AdminShipments />}
/>
        <Route
         path="/profile"
        element={<Profile />}
/>
<Route
  path="/notifications"
  element={<Notifications />}
/>
<Route
  path="/settings"
  element={<Settings />}
/>

<Route
  path="/addresses"
  element={<Addresses />}
/>
<Route path="/help" element={<Help />} />
<Route
  path="/verify-email"
  element={<VerifyEmail />}
/>
<Route
  path="/payment-methods"
  element={<PaymentMethods />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;