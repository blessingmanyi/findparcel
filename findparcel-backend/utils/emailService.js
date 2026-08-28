const nodemailer = require("nodemailer");

// =====================================================
// BREVO EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================================
// SEND RECEIVER SHIPMENT EMAIL
// =====================================================

const sendShipmentCreatedEmail = async (shipment) => {
  const receiverName = shipment.receiver.name;
  const receiverEmail = shipment.receiver.email;
  const senderName = shipment.sender.name;

  const createdDate = new Date(
    shipment.createdAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const arrivalDate = new Date(
    shipment.estimatedDelivery
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await transporter.sendMail({
    from: `"FindParcel" <${process.env.EMAIL_FROM}>`,

    to: receiverEmail,

    subject: "You Have a New Package - FindParcel",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        padding: 30px;
        background: #f5f6ff;
        border-radius: 12px;
      ">

        <h2 style="
          color: #3028c9;
          margin-bottom: 20px;
        ">
          📦 FindParcel - New Package
        </h2>

        <p>
          Dear <strong>${receiverName}</strong>,
        </p>

        <p>
          You have a package from
          <strong>${senderName}</strong>
          that has been created through FindParcel.
        </p>

        <div style="
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        ">

          <h3 style="color: #3028c9;">
            Shipment Information
          </h3>

          <p>
            <strong>Tracking Number:</strong>
            ${shipment.trackingNumber}
          </p>

          <p>
            <strong>Package:</strong>
            ${shipment.packageInfo.type}
          </p>

          <p>
            <strong>Description:</strong>
            ${shipment.packageInfo.description}
          </p>

          <p>
            <strong>Weight:</strong>
            ${shipment.packageInfo.weight} kg
          </p>

          <p>
            <strong>From:</strong>
            ${shipment.sender.city}
          </p>

          <p>
            <strong>To:</strong>
            ${shipment.receiver.city}
          </p>

          <p>
            <strong>Created Date:</strong>
            ${createdDate}
          </p>

          <p>
            <strong>Expected Arrival:</strong>
            ${arrivalDate}
          </p>

          <p>
            <strong>Delivery Speed:</strong>
            ${shipment.deliverySpeed}
          </p>

          <p>
            <strong>Status:</strong>
            ${shipment.status}
          </p>

        </div>

        <p>
          You can use your tracking number to track
          your package on FindParcel.
        </p>

        <p>
          <strong>Tracking Number:</strong>
          ${shipment.trackingNumber}
        </p>

        <p style="margin-top: 30px;">
          Thank you for using FindParcel.
        </p>

        <p>
          Regards,<br />
          <strong>FindParcel Team</strong>
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendShipmentCreatedEmail,
};