import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Addresses.css";

function Addresses() {
  const navigate = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // ADDRESSES
  // =====================================================

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FORM
  // =====================================================

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Cameroon");
  const [postalCode, setPostalCode] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("findparcelUser");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      setUser(loggedInUser);

      setFullName(
        loggedInUser.fullName || ""
      );

      setPhone(
        loggedInUser.phone || ""
      );
    } catch (error) {
      console.error(
        "User data error:",
        error
      );

      localStorage.removeItem(
        "findparcelUser"
      );

      navigate("/login");
    }
  }, [navigate]);

  // =====================================================
  // GET ADDRESSES FROM MONGODB
  // =====================================================

  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError("");

        const customerId =
          user._id || user.id;

        if (!customerId) {
          setError(
            "Your customer ID could not be found."
          );
          return;
        }

        const response = await fetch(
          `https://findparcel.onrender.com/api/addresses/customer/${customerId}`
        );

        const responseText =
          await response.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load addresses."
          );
        }

        // Backend returns the array directly
        setAddresses(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Fetch addresses error:",
          error
        );

        setError(
          error.message ||
            "Unable to load your addresses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setLabel("Home");

    setFullName(
      user?.fullName || ""
    );

    setPhone(
      user?.phone || ""
    );

    setStreet("");
    setCity("");
    setRegion("");
    setCountry("Cameroon");
    setPostalCode("");

    setEditingId(null);

    setMessage("");
    setError("");
  };

  // =====================================================
  // ADD ADDRESS
  // =====================================================

  const handleAddAddress = () => {
    resetForm();
    setShowForm(true);
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // =====================================================
  // SAVE / UPDATE ADDRESS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!fullName.trim()) {
      setError(
        "Please enter the recipient's name."
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Please enter a phone number."
      );
      return;
    }

    if (!street.trim()) {
      setError(
        "Please enter the street address."
      );
      return;
    }

    if (!city.trim()) {
      setError(
        "Please enter the city."
      );
      return;
    }

    if (!region.trim()) {
      setError(
        "Please enter the region."
      );
      return;
    }

    if (!country.trim()) {
      setError(
        "Please enter the country."
      );
      return;
    }

    const customerId =
      user?._id || user?.id;

    if (!customerId) {
      setError(
        "Your customer ID could not be found."
      );
      return;
    }

    // ---------------------------------------------------
    // CHECK IF THIS IS THE FIRST ADDRESS
    // ---------------------------------------------------

    const shouldBeDefault =
      editingId
        ? undefined
        : addresses.length === 0;

    const addressData = {
      customerId,

      label: label.trim(),

      fullName:
        fullName.trim(),

      phone:
        phone.trim(),

      street:
        street.trim(),

      city:
        city.trim(),

      region:
        region.trim(),

      country:
        country.trim(),

      postalCode:
        postalCode.trim(),

      ...(editingId
        ? {}
        : {
            isDefault:
              shouldBeDefault,
          }),
    };

    try {
      // =================================================
      // UPDATE EXISTING ADDRESS
      // =================================================

      if (editingId) {
        const response = await fetch(
          `https://findparcel.onrender.com//api/addresses/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              addressData
            ),
          }
        );

        const responseText =
          await response.text();

        let data;

        try {
          data = JSON.parse(
            responseText
          );
        } catch {
          throw new Error(
            "Invalid server response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update address."
          );
        }

        setAddresses((previous) =>
          previous.map((item) =>
            item._id === editingId
              ? data.address
              : item
          )
        );

        setMessage(
          "Address updated successfully."
        );

        setShowForm(false);
        resetForm();

        return;
      }

      // =================================================
      // CREATE NEW ADDRESS
      // =================================================

      const response = await fetch(
        "https://findparcel.onrender.com/api/addresses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            addressData
          ),
        }
      );

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save address."
        );
      }

      setAddresses((previous) => [
        ...previous,
        data.address,
      ]);

      setMessage(
        "Address added successfully."
      );

      setShowForm(false);
      resetForm();

    } catch (error) {
      console.error(
        "Save address error:",
        error
      );

      setError(
        error.message ||
          "Unable to save address."
      );
    }
  };

  // =====================================================
  // EDIT ADDRESS
  // =====================================================

  const handleEdit = (item) => {
    setEditingId(item._id);

    setLabel(
      item.label || "Home"
    );

    setFullName(
      item.fullName || ""
    );

    setPhone(
      item.phone || ""
    );

    setStreet(
      item.street || ""
    );

    setCity(
      item.city || ""
    );

    setRegion(
      item.region || ""
    );

    setCountry(
      item.country || "Cameroon"
    );

    setPostalCode(
      item.postalCode || ""
    );

    setMessage("");
    setError("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this address?"
      );

    if (!confirmDelete) {
      return;
    }

    const customerId =
      user?._id || user?.id;

    try {
      setError("");

      const response = await fetch(
        `https://findparcel.onrender.com/api/addresses/${id}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customerId,
          }),
        }
      );

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete address."
        );
      }

      setAddresses((previous) =>
        previous.filter(
          (item) =>
            item._id !== id
        )
      );

      setMessage(
        "Address deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      setError(
        error.message ||
          "Unable to delete address."
      );
    }
  };

  // =====================================================
  // SET DEFAULT ADDRESS
  // =====================================================

  const handleSetDefault = async (id) => {
    const customerId =
      user?._id || user?.id;

    try {
      setError("");

      const response = await fetch(
        `https://findparcel.onrender.com/api/addresses/${id}/default`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customerId,
          }),
        }
      );

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch {
        throw new Error(
          "Invalid server response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to set default address."
        );
      }

      // Update all addresses locally
      setAddresses((previous) =>
        previous.map((item) => ({
          ...item,

          isDefault:
            item._id === id,
        }))
      );

      setMessage(
        "Default address updated successfully."
      );

    } catch (error) {
      console.error(
        "Set default address error:",
        error
      );

      setError(
        error.message ||
          "Unable to set default address."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="addresses-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="addresses-header">

        <Link
          to="/profile"
          className="addresses-back-button"
        >
          ←
        </Link>

        <div>
          <h1>
            My Addresses
          </h1>

          <p>
            Manage your delivery addresses
          </p>
        </div>

      </header>


      {/* =================================================
          INTRO
      ================================================= */}

      <section className="addresses-introduction">

        <div>
          <h2>
            Saved Addresses
          </h2>

          <p>
            Save your frequently used delivery
            addresses for faster shipping.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="addresses-add-button"
            onClick={
              handleAddAddress
            }
          >
            + Add Address
          </button>
        )}

      </section>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && !showForm && (
        <div className="addresses-message">
          {message}
        </div>
      )}


      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && !showForm && (
        <div className="addresses-error">
          {error}
        </div>
      )}


      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (
        <section className="addresses-form-card">

          <div className="addresses-form-heading">

            <div className="addresses-form-icon">
              📍
            </div>

            <div>
              <h2>
                {editingId
                  ? "Edit Address"
                  : "Add New Address"}
              </h2>

              <p>
                Enter the delivery address
                details below.
              </p>
            </div>

          </div>


          <form
            className="addresses-form"
            onSubmit={handleSubmit}
          >

            {/* Address Label */}

            <div className="addresses-form-group">

              <label htmlFor="address-label">
                Address Label
              </label>

              <select
                id="address-label"
                value={label}
                onChange={(e) =>
                  setLabel(
                    e.target.value
                  )
                }
              >
                <option value="Home">
                  Home
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Office">
                  Office
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>


            {/* Full Name */}

            <div className="addresses-form-group">

              <label htmlFor="address-full-name">
                Recipient Full Name
              </label>

              <input
                id="address-full-name"
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                placeholder="Enter recipient's full name"
                required
              />

            </div>


            {/* Phone */}

            <div className="addresses-form-group">

              <label htmlFor="address-phone">
                Phone Number
              </label>

              <input
                id="address-phone"
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Enter phone number"
                required
              />

            </div>


            {/* Street */}

            <div className="addresses-form-group">

              <label htmlFor="street-address">
                Street Address
              </label>

              <input
                id="street-address"
                type="text"
                value={street}
                onChange={(e) =>
                  setStreet(
                    e.target.value
                  )
                }
                placeholder="Enter street address"
                required
              />

            </div>


            {/* City + Region */}

            <div className="addresses-form-grid">

              <div className="addresses-form-group">

                <label htmlFor="address-city">
                  City
                </label>

                <input
                  id="address-city"
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Yaoundé"
                  required
                />

              </div>


              <div className="addresses-form-group">

                <label htmlFor="address-region">
                  Region
                </label>

                <input
                  id="address-region"
                  type="text"
                  value={region}
                  onChange={(e) =>
                    setRegion(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Centre"
                  required
                />

              </div>

            </div>


            {/* Country */}

            <div className="addresses-form-group">

              <label htmlFor="address-country">
                Country
              </label>

              <input
                id="address-country"
                type="text"
                value={country}
                onChange={(e) =>
                  setCountry(
                    e.target.value
                  )
                }
                placeholder="Enter country"
                required
              />

            </div>


            {/* Postal Code */}

            <div className="addresses-form-group">

              <label htmlFor="postal-code">
                Postal Code
              </label>

              <input
                id="postal-code"
                type="text"
                value={postalCode}
                onChange={(e) =>
                  setPostalCode(
                    e.target.value
                  )
                }
                placeholder="Enter postal code (optional)"
              />

            </div>


            {/* Error */}

            {error && (
              <div className="addresses-error">
                {error}
              </div>
            )}


            {/* Buttons */}

            <div className="addresses-form-actions">

              <button
                type="button"
                className="addresses-cancel-button"
                onClick={
                  handleCancel
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="addresses-save-button"
              >
                {editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =================================================
          ADDRESS LIST
      ================================================= */}

      {!showForm && (
        <section className="addresses-list">

          {loading ? (

            <div className="addresses-empty">

              <div className="addresses-empty-icon">
                ⏳
              </div>

              <h3>
                Loading Addresses...
              </h3>

              <p>
                Please wait while we load your
                saved addresses.
              </p>

            </div>

          ) : addresses.length === 0 ? (

            <div className="addresses-empty">

              <div className="addresses-empty-icon">
                📍
              </div>

              <h3>
                No Saved Addresses
              </h3>

              <p>
                You haven't saved any delivery
                addresses yet.
              </p>

              <button
                type="button"
                className="addresses-empty-button"
                onClick={
                  handleAddAddress
                }
              >
                + Add Your First Address
              </button>

            </div>

          ) : (

            addresses.map((item) => (

              <article
                className="address-card"
                key={item._id}
              >

                {/* Card Header */}

                <div className="address-card-header">

                  <div className="address-card-title">

                    <div className="address-icon">
                      📍
                    </div>

                    <div>
                      <h3>
                        {item.label}
                      </h3>

                      {item.isDefault && (
                        <span className="default-badge">
                          Default
                        </span>
                      )}
                    </div>

                  </div>

                </div>


                {/* Address Details */}

                <div className="address-card-details">

                  <strong>
                    {item.fullName}
                  </strong>

                  <span>
                    📞 {item.phone}
                  </span>

                  <span>
                    {item.street}
                  </span>

                  <span>
                    {item.city},{" "}
                    {item.region}
                  </span>

                  <span>
                    {item.country}
                  </span>

                  {item.postalCode && (
                    <span>
                      Postal Code:{" "}
                      {item.postalCode}
                    </span>
                  )}

                </div>


                {/* Actions */}

                <div className="address-card-actions">

                  {!item.isDefault && (
                    <button
                      type="button"
                      className="address-default-button"
                      onClick={() =>
                        handleSetDefault(
                          item._id
                        )
                      }
                    >
                      ⭐ Set as Default
                    </button>
                  )}

                  <button
                    type="button"
                    className="address-edit-button"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    className="address-delete-button"
                    onClick={() =>
                      handleDelete(
                        item._id
                      )
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </article>

            ))

          )}

        </section>
      )}

    </main>
  );
}

export default Addresses;