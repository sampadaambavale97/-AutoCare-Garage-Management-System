
import { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

const API = "http://127.0.0.1:8000/api";

const getList = (data) =>
  Array.isArray(data) ? data : data.results || [];

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("\n")
        : "Request failed";
    throw new Error(message || "Request failed");
  }

  return data;
}

export default function AdvisorDashboard({ onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerData, setCustomerData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: ""
  });

  const [vehicleData, setVehicleData] = useState({
    customer: "",
    number: "",
    brand: "",
    model: "",
    type: "",
    date: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [customerRes, vehicleRes, jobRes] = await Promise.all([
        fetch(`${API}/customers/`),
        fetch(`${API}/vehicles/`),
        fetch(`${API}/jobs/`)
      ]);

      const [customerData, vehicleData, jobData] = await Promise.all([
        readResponse(customerRes),
        readResponse(vehicleRes),
        readResponse(jobRes)
      ]);

      setCustomers(getList(customerData));
      setVehicles(getList(vehicleData));
      setJobs(getList(jobData));
    } catch (err) {
      setError(err.message || "Unable to load Django records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCustomerChange = (e) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value
    });
  };

  const handleVehicleChange = (e) => {
    setVehicleData({
      ...vehicleData,
      [e.target.name]: e.target.value
    });
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API}/customers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData)
      });

      await readResponse(response);

      setCustomerData({
        name: "",
        mobile: "",
        email: "",
        address: ""
      });

      setShowCustomerForm(false);
      setSuccess("Customer added successfully!");
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        customer: Number(vehicleData.customer),
        number: vehicleData.number.trim().toUpperCase(),
        brand: vehicleData.brand,
        model: vehicleData.model,
        type: vehicleData.type,
        date: vehicleData.date
      };

      const response = await fetch(`${API}/vehicles/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      await readResponse(response);

      setVehicleData({
        customer: "",
        number: "",
        brand: "",
        model: "",
        type: "",
        date: ""
      });

      setShowVehicleForm(false);
      setSuccess("Vehicle registered successfully!");
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm(
      "Delete this customer? Their vehicles and related job cards may also be deleted."
    )) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API}/customers/${id}/`, {
        method: "DELETE"
      });

      if (!response.ok) await readResponse(response);

      setSuccess("Customer deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm(
      "Delete this vehicle? Its related job cards and bills may also be deleted."
    )) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API}/vehicles/${id}/`, {
        method: "DELETE"
      });

      if (!response.ok) await readResponse(response);

      setSuccess("Vehicle deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getOwner = (vehicle) => {
    if (vehicle.owner) return vehicle.owner;

    const customerId =
      typeof vehicle.customer === "object"
        ? vehicle.customer?.id
        : vehicle.customer;

    return customers.find(c => String(c.id) === String(customerId))?.name || "N/A";
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <h2>Loading Advisor Dashboard...</h2>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>📋 Service Advisor Dashboard</h1>
          <p>Customer and Vehicle Service Management</p>
        </div>
        <button className="dashboard-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      {error && (
        <section className="customer-form-section">
          <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>
          <button className="dashboard-button" onClick={fetchData}>
            Retry
          </button>
        </section>
      )}

      {success && (
        <section className="customer-form-section">
          <p style={{ color: "green" }}>{success}</p>
        </section>
      )}

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Total Customers</h3>
          <h2>{customers.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">🚗</div>
          <h3>Total Vehicles</h3>
          <h2>{vehicles.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">🛠️</div>
          <h3>Total Job Cards</h3>
          <h2>{jobs.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">➕</div>
          <h3>Add Customer</h3>
          <p>Register a new customer.</p>
          <button
            className="dashboard-button"
            onClick={() => {
              setShowCustomerForm(!showCustomerForm);
              setShowVehicleForm(false);
              setError("");
              setSuccess("");
            }}
          >
            Add Customer
          </button>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">🚘</div>
          <h3>Vehicle Registration</h3>
          <p>Register a customer's vehicle.</p>
          <button
            className="dashboard-button"
            onClick={() => {
              setShowVehicleForm(!showVehicleForm);
              setShowCustomerForm(false);
              setError("");
              setSuccess("");
            }}
          >
            Add Vehicle
          </button>
        </article>
      </div>

      {showCustomerForm && (
        <section className="customer-form-section">
          <h2>➕ Add New Customer</h2>
          <form onSubmit={handleCustomerSubmit}>
            <label>Customer Name</label>
            <input
              name="name"
              value={customerData.name}
              onChange={handleCustomerChange}
              placeholder="Enter customer name"
              required
            />

            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={customerData.mobile}
              onChange={handleCustomerChange}
              placeholder="10 digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleCustomerChange}
              placeholder="Enter email address"
            />

            <label>Address</label>
            <textarea
              name="address"
              value={customerData.address}
              onChange={handleCustomerChange}
              placeholder="Enter customer address"
            />

            <div className="form-buttons">
              <button className="dashboard-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Customer"}
              </button>
              <button
                className="cancel-button"
                type="button"
                onClick={() => setShowCustomerForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {showVehicleForm && (
        <section className="vehicle-form-section">
          <h2>🚗 Vehicle Registration</h2>

          {customers.length === 0 ? (
            <p>Please add a customer first, then register their vehicle.</p>
          ) : (
            <form onSubmit={handleVehicleSubmit}>
              <label>Vehicle Owner</label>
              <select
                name="customer"
                value={vehicleData.customer}
                onChange={handleVehicleChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.mobile}
                  </option>
                ))}
              </select>

              <label>Vehicle Number</label>
              <input
                name="number"
                value={vehicleData.number}
                onChange={handleVehicleChange}
                placeholder="Example: MH09AB1234"
                required
              />

              <label>Vehicle Brand</label>
              <input
                name="brand"
                value={vehicleData.brand}
                onChange={handleVehicleChange}
                placeholder="Example: Maruti Suzuki"
                required
              />

              <label>Vehicle Model</label>
              <input
                name="model"
                value={vehicleData.model}
                onChange={handleVehicleChange}
                placeholder="Example: Swift"
                required
              />

              <label>Vehicle Type</label>
              <select
                name="type"
                value={vehicleData.type}
                onChange={handleVehicleChange}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Truck">Truck</option>
                <option value="Other">Other</option>
              </select>

              <label>Registration Date</label>
              <input
                type="date"
                name="date"
                value={vehicleData.date}
                onChange={handleVehicleChange}
                required
              />

              <div className="form-buttons">
                <button className="dashboard-button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Vehicle"}
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setShowVehicleForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="customer-list-section">
        <h2>👥 Customer List</h2>
        {customers.length === 0 ? (
          <p>No customers found in database.</p>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.mobile}</td>
                    <td>{customer.email || "N/A"}</td>
                    <td>{customer.address || "N/A"}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="vehicle-list-section">
        <h2>🚗 Vehicle List</h2>
        {vehicles.length === 0 ? (
          <p>No vehicles found in database.</p>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Vehicle Number</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{getOwner(vehicle)}</td>
                    <td>{vehicle.number}</td>
                    <td>{vehicle.brand}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.date}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
