import { useState } from "react";
import { Link } from "react-router-dom";
import "./Help.css";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [supportMethod, setSupportMethod] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How can I track my parcel?",
      answer:
        "Go to the Track Parcel page and enter your tracking number. You will be able to see your parcel status, current location and estimated delivery date.",
    },
    {
      question: "Where can I find my tracking number?",
      answer:
        "Your tracking number is generated when you successfully create a shipment. You can also find your previous shipments in the My Shipments section.",
    },
    {
      question: "How do I send a parcel?",
      answer:
        "Select Send Parcel from the dashboard, enter the sender and receiver information, provide the package details, choose a delivery option and create your shipment.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery usually takes 2–4 business days, while express delivery usually takes 1–2 business days.",
    },
    {
      question: "Can I view my previous shipments?",
      answer:
        "Yes. Open My Shipments from your dashboard or profile to view your shipment history and track individual parcels.",
    },
    {
      question: "What should I do if my parcel is delayed?",
      answer:
        "First check the latest tracking information. If the parcel remains delayed, contact FindParcel support for assistance.",
    },
  ];

  return (
    <main className="help-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="help-header">

        <Link
          to="/profile"
          className="help-back-button"
        >
          ←
        </Link>

        <div>
          <h1>Help & Support</h1>

          <p>
            We're here to help you
          </p>
        </div>

      </header>


      {/* =========================
          INTRODUCTION
      ========================= */}

      <section className="help-introduction">

        <div className="help-introduction-icon">
          ❓
        </div>

        <div>
          <h2>
            How can we help?
          </h2>

          <p>
            Find answers to common questions or
            contact our support team.
          </p>
        </div>

      </section>


      {/* =========================
          SUPPORT OPTIONS
      ========================= */}

     {/* =========================
    SUPPORT OPTIONS
========================= */}

<section className="help-options">

  {/* =========================
      SMS SUPPORT
  ========================= */}

  <div className="help-option-card">

    <div className="help-option-icon">
      💬
    </div>

    <div className="help-option-content">

      <h3>
        Chat with Support
      </h3>

      <p>
        Send us an SMS and we'll be happy
        to assist you.
      </p>

      <button
        type="button"
        onClick={() => {
          setSupportMethod(
            supportMethod === "sms"
              ? null
              : "sms"
          );
        }}
      >
        {supportMethod === "sms"
          ? "Hide Number"
          : "Send SMS"}
      </button>

      {supportMethod === "sms" && (
        <div className="support-contact-info">

          <span>
            Use this number to send us an SMS:
          </span>

          <a
            href="sms:+237651184339"
            className="support-contact-link"
          >
            +237 651 184 339
          </a>

        </div>
      )}

    </div>

  </div>


  {/* =========================
      EMAIL SUPPORT
  ========================= */}

  <div className="help-option-card">

    <div className="help-option-icon">
      📧
    </div>

    <div className="help-option-content">

      <h3>
        Email Support
      </h3>

      <p>
        Send us an email and we'll get back
        to you.
      </p>

      <button
        type="button"
        onClick={() => {
          setSupportMethod(
            supportMethod === "email"
              ? null
              : "email"
          );
        }}
      >
        {supportMethod === "email"
          ? "Hide Email"
          : "Email Us"}
      </button>

      {supportMethod === "email" && (
        <div className="support-contact-info">

          <span>
            Use this email to send us emails:
          </span>

          <a
            href="mailto:blessingmanyimuuah@gmail.com"
            className="support-contact-link"
          >
            blessingmanyimuuah@gmail.com
          </a>

        </div>
      )}

    </div>

  </div>


  {/* =========================
      CALL SUPPORT
  ========================= */}

  <div className="help-option-card">

    <div className="help-option-icon">
      📞
    </div>

    <div className="help-option-content">

      <h3>
        Call Support
      </h3>

      <p>
        Call our support team directly for
        assistance.
      </p>

      <button
        type="button"
        onClick={() => {
          setSupportMethod(
            supportMethod === "call"
              ? null
              : "call"
          );
        }}
      >
        {supportMethod === "call"
          ? "Hide Number"
          : "Call Us"}
      </button>

      {supportMethod === "call" && (
        <div className="support-contact-info">

          <span>
            Use this number to call us:
          </span>

          <a
            href="tel:+237651184339"
            className="support-contact-link"
          >
            +237 651 184 339
          </a>

        </div>
      )}

    </div>

  </div>

</section>

      {/* =========================
          FAQ
      ========================= */}

      <section className="faq-section">

        <div className="section-heading">

          <h2>
            Frequently Asked Questions
          </h2>

          <p>
            Find quick answers to common questions.
          </p>

        </div>


        <div className="faq-list">

          {faqs.map((faq, index) => (

            <div
              className={
                openFaq === index
                  ? "faq-item open"
                  : "faq-item"
              }
              key={index}
            >

              <button
                type="button"
                className="faq-question"
                onClick={() => toggleFaq(index)}
              >

                <span>
                  {faq.question}
                </span>

                <strong>
                  {openFaq === index
                    ? "−"
                    : "+"}
                </strong>

              </button>


              {openFaq === index && (
                <div className="faq-answer">

                  <p>
                    {faq.answer}
                  </p>

                </div>
              )}

            </div>

          ))}

        </div>

      </section>


      {/* =========================
          CONTACT SUPPORT
      ========================= */}

      <section className="help-contact-card">

        <div className="help-contact-icon">
          🎧
        </div>

        <div className="help-contact-content">

          <h2>
            Still need help?
          </h2>

          <p>
            Our support team is ready to assist you
            with your shipment.
          </p>

          <button
            type="button"
            className="help-contact-button"
            onClick={() =>
              setSupportMethod(
                supportMethod === "email"
                  ? null
                  : "email"
              )
            }
          >
            Contact Support
          </button>

        </div>

      </section>


      {/* =========================
          BACK TO PROFILE
      ========================= */}

      <Link
        to="/profile"
        className="help-profile-button"
      >
        Back to Profile
      </Link>

    </main>
  );
}

export default Help;