import { createContext, useContext, useState } from "react";

const ShipmentContext = createContext();

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState([
    {
      trackingNumber: "FP123456789",
      status: "In Transit",
      statusClass: "transit",
      sender: "Douala",
      receiver: "Yaoundé",
      packageType: "Medium Package",
      weight: "2 kg",
      estimatedDelivery: "August 16, 2026",
      progress: 65,
      firstLabel: "Shipped",
      firstDate: "Aug 10, 2026",
      secondLabel: "Expected",
      secondDate: "Aug 13, 2026",
      buttonText: "Track",

      timeline: [
        {
          title: "Shipment Picked Up",
          location: "Douala",
          date: "August 13, 2026",
          time: "09:30 AM",
          completed: true,
        },
        {
          title: "Arrived at Sorting Center",
          location: "Douala",
          date: "August 13, 2026",
          time: "12:45 PM",
          completed: true,
        },
        {
          title: "In Transit",
          location: "On the way to Yaoundé",
          date: "August 13, 2026",
          time: "03:20 PM",
          completed: true,
        },
        {
          title: "Out for Delivery",
          location: "Yaoundé",
          date: "Expected August 16",
          time: "",
          completed: false,
        },
        {
          title: "Delivered",
          location: "Yaoundé",
          date: "Expected August 16",
          time: "",
          completed: false,
        },
      ],
    },

    {
      trackingNumber: "FP987654321",
      status: "Delivered",
      statusClass: "delivered",
      sender: "Yaoundé",
      receiver: "Buea",
      packageType: "Small Package",
      weight: "1 kg",
      estimatedDelivery: "Delivered August 7, 2026",
      progress: 100,
      firstLabel: "Shipped",
      firstDate: "Aug 05, 2026",
      secondLabel: "Delivered",
      secondDate: "Aug 07, 2026",
      buttonText: "View",

      timeline: [
        {
          title: "Shipment Picked Up",
          location: "Yaoundé",
          date: "August 5, 2026",
          time: "08:30 AM",
          completed: true,
        },
        {
          title: "Arrived at Sorting Center",
          location: "Yaoundé",
          date: "August 5, 2026",
          time: "11:00 AM",
          completed: true,
        },
        {
          title: "In Transit",
          location: "On the way to Buea",
          date: "August 6, 2026",
          time: "09:15 AM",
          completed: true,
        },
        {
          title: "Out for Delivery",
          location: "Buea",
          date: "August 7, 2026",
          time: "08:00 AM",
          completed: true,
        },
        {
          title: "Delivered",
          location: "Buea",
          date: "August 7, 2026",
          time: "02:30 PM",
          completed: true,
        },
      ],
    },

    {
      trackingNumber: "FP456789123",
      status: "Pending",
      statusClass: "pending",
      sender: "Limbe",
      receiver: "Douala",
      packageType: "Large Package",
      weight: "5 kg",
      estimatedDelivery: "August 18, 2026",
      progress: 15,
      firstLabel: "Created",
      firstDate: "Aug 11, 2026",
      secondLabel: "Status",
      secondDate: "Awaiting Pickup",
      buttonText: "View",

      timeline: [
        {
          title: "Shipment Created",
          location: "Limbe",
          date: "August 11, 2026",
          time: "10:00 AM",
          completed: true,
        },
        {
          title: "Awaiting Pickup",
          location: "Limbe",
          date: "August 11, 2026",
          time: "",
          completed: false,
        },
        {
          title: "In Transit",
          location: "Douala",
          date: "Expected",
          time: "",
          completed: false,
        },
        {
          title: "Out for Delivery",
          location: "Douala",
          date: "Expected August 18",
          time: "",
          completed: false,
        },
        {
          title: "Delivered",
          location: "Douala",
          date: "Expected August 18",
          time: "",
          completed: false,
        },
      ],
    },
  ]);

  const addShipment = (newShipment) => {
    setShipments((currentShipments) => [
      newShipment,
      ...currentShipments,
    ]);
  };

  const getShipmentByTrackingNumber = (trackingNumber) => {
    return shipments.find(
      (shipment) =>
        shipment.trackingNumber ===
        trackingNumber.trim().toUpperCase()
    );
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        addShipment,
        getShipmentByTrackingNumber,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  return useContext(ShipmentContext);
}