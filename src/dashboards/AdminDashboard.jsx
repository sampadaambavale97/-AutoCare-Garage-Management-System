import { useState, useEffect } from "react";
import "./Dashboard.css";
import OtherModules from "./OtherModules";

const API_URL = "http://127.0.0.1:8000/api/customers/";
const VEHICLE_API_URL = "http://127.0.0.1:8000/api/vehicles/";
const JOB_API_URL = "http://127.0.0.1:8000/api/jobs/";
const STAFF_API_URL = "http://127.0.0.1:8000/api/staff/";

const items = [
  { icon: "👥", title: "Customer Management", description: "Manage customer registration and details." },
  { icon: "🚘", title: "Vehicle Management", description: "View and manage registered vehicles." },
  { icon: "🛠️", title: "Service & Job Cards", description: "Monitor all service requests and repair jobs." },
  { icon: "👨‍🔧", title: "Staff Management", description: "Manage advisors and mechanics." },
  { icon: "💳", title: "Billing & Payments", description: "Manage garage bills and payments." },
  { icon: "📦", title: "Spare Parts & Stock", description: "Monitor spare parts and inventory." },
  { icon: "📊", title: "Reports", description: "Review garage performance and reports." }
];

const emptyCustomer = {
  name: "",
  mobile: "",
  email: "",
  address: ""
};

const emptyVehicle = {
  customer: "",
  number: "",
  brand: "",
  model: "",
  type: "",
  date: ""
};

const emptyJob = {
  vehicleNumber: "",
  serviceType: "",
  complaint: "",
  date: "",
  status: "Pending",
  cost: ""
};

const emptyStaff = {
  name: "",
  mobile: "",
  email: "",
  role: "Mechanic",
  address: "",
  salary: "",
  status: "Active"
};

export default function AdminDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  // CUSTOMER STATES
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyCustomer);

  // VEHICLE STATES
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [editVehicleId, setEditVehicleId] = useState(null);
  const [vehicleData, setVehicleData] = useState(emptyVehicle);

  // JOB CARD STATES
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [jobData, setJobData] = useState(emptyJob);

  // STAFF STATES
  const [staff, setStaff] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [staffData, setStaffData] = useState(emptyStaff);

  // LOAD CUSTOMERS FROM DJANGO
  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Customer loading error:", error);
        alert("Unable to load customers. Please check Django server.");
      }
    }

    loadCustomers();
  }, []);

  // LOAD VEHICLES FROM DJANGO
  useEffect(() => {
    async function loadVehicles() {
      try {
        const response = await fetch(VEHICLE_API_URL);

        if (!response.ok) {
          throw new Error("Failed to load vehicles");
        }

        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Vehicle loading error:", error);
        alert("Unable to load vehicles. Check Django server.");
      }
    }

    loadVehicles();
  }, []);

  // LOAD JOB CARDS FROM DJANGO DATABASE
  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch(JOB_API_URL);
        if (!response.ok) throw new Error("Failed to load job cards");
        setJobs(await response.json());
      } catch (error) {
        console.error("Job card loading error:", error);
        alert("Unable to load Job Cards. Check Django server.");
      }
    }
    loadJobs();
  }, []);

  // LOAD STAFF FROM DJANGO DATABASE
  useEffect(() => {
    async function loadStaff() {
      try {
        const response = await fetch(STAFF_API_URL);
        if (!response.ok) throw new Error("Failed to load staff");
        setStaff(await response.json());
      } catch (error) {
        console.error("Staff loading error:", error);
        alert("Unable to load Staff. Check Django server.");
      }
    }
    loadStaff();
  }, []);

  // CUSTOMER FUNCTIONS

  function handleCustomerChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault();

    try {
      const url = editId
        ? `${API_URL}${editId}/`
        : API_URL;

      const response = await fetch(url, {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const savedCustomer = await response.json();

      if (editId) {
        setCustomers((previous) =>
          previous.map((customer) =>
            String(customer.id) === String(editId)
              ? savedCustomer
              : customer
          )
        );

        alert("Customer updated successfully!");
      } else {
        setCustomers((previous) => [
          savedCustomer,
          ...previous
        ]);

        alert("Customer added successfully!");
      }

      setFormData(emptyCustomer);
      setEditId(null);
      setShowForm(false);

    } catch (error) {
      console.error("Customer save error:", error);
      alert("Customer save failed: " + error.message);
    }
  }

  function handleEdit(customer) {
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
      address: customer.address || ""
    });

    setEditId(customer.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers((previous) =>
        previous.filter(
          (customer) => String(customer.id) !== String(id)
        )
      );

      alert("Customer deleted successfully!");

    } catch (error) {
      console.error("Customer delete error:", error);
      alert("Unable to delete customer. Please check Django server.");
    }
  }

  // VEHICLE FUNCTIONS

  function handleVehicleChange(event) {
    const { name, value } = event.target;

    setVehicleData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // ADD / UPDATE VEHICLE
  async function handleVehicleSubmit(event) {
    event.preventDefault();

    const number = vehicleData.number.trim().toUpperCase();

    const duplicate = vehicles.some(
      (vehicle) =>
        vehicle.number.toUpperCase() === number &&
        String(vehicle.id) !== String(editVehicleId)
    );

    if (duplicate) {
      alert("This vehicle number is already registered!");
      return;
    }

    const payload = {
      customer: Number(vehicleData.customer),
      number,
      brand: vehicleData.brand.trim(),
      model: vehicleData.model.trim(),
      type: vehicleData.type,
      date: vehicleData.date
    };

    try {
      const url = editVehicleId
        ? `${VEHICLE_API_URL}${editVehicleId}/`
        : VEHICLE_API_URL;

      const response = await fetch(url, {
        method: editVehicleId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const savedVehicle = await response.json();

      if (editVehicleId) {
        setVehicles((previous) =>
          previous.map((vehicle) =>
            String(vehicle.id) === String(editVehicleId)
              ? savedVehicle
              : vehicle
          )
        );

        alert("Vehicle updated successfully!");
      } else {
        setVehicles((previous) => [
          savedVehicle,
          ...previous
        ]);

        alert("Vehicle registered successfully!");
      }

      setVehicleData(emptyVehicle);
      setEditVehicleId(null);
      setShowVehicleForm(false);

    } catch (error) {
      console.error("Vehicle save error:", error);
      alert("Vehicle save failed: " + error.message);
    }
  }

  // EDIT VEHICLE
  function handleVehicleEdit(vehicle) {
    setVehicleData({
      customer: String(vehicle.customer),
      number: vehicle.number,
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      date: vehicle.date
    });

    setEditVehicleId(vehicle.id);
    setShowVehicleForm(true);
  }

  // DELETE VEHICLE
  async function handleVehicleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    try {
      const response = await fetch(
        `${VEHICLE_API_URL}${id}/`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      setVehicles((previous) =>
        previous.filter(
          (vehicle) => String(vehicle.id) !== String(id)
        )
      );

      alert("Vehicle deleted successfully!");

    } catch (error) {
      console.error("Vehicle delete error:", error);
      alert("Unable to delete vehicle: " + error.message);
    }
  }

  // CANCEL VEHICLE FORM
  function cancelVehicleForm() {
    setShowVehicleForm(false);
    setEditVehicleId(null);
    setVehicleData(emptyVehicle);
  }

  // JOB CARD FUNCTIONS

  function handleJobChange(event) {
    const { name, value } = event.target;

    setJobData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleJobSubmit(event) {
    event.preventDefault();

    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.number === jobData.vehicleNumber
    );

    if (!selectedVehicle) {
      alert("Please select a registered vehicle.");
      return;
    }

    const payload = {
      vehicle: selectedVehicle.id,
      serviceType: jobData.serviceType,
      complaint: jobData.complaint,
      date: jobData.date,
      status: jobData.status,
      cost: Number(jobData.cost || 0)
    };

    try {
      const url = editJobId ? `${JOB_API_URL}${editJobId}/` : JOB_API_URL;
      const response = await fetch(url, {
        method: editJobId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }

      if (editJobId) {
        setJobs((previous) =>
          previous.map((job) => job.id === editJobId ? result : job)
        );
        alert("Job card updated and saved in database!");
      } else {
        setJobs((previous) => [result, ...previous]);
        alert("Job card created and saved in database!");
      }

      setJobData(emptyJob);
      setEditJobId(null);
      setShowJobForm(false);
    } catch (error) {
      console.error("Job card save error:", error);
      alert("Unable to save Job Card: " + error.message);
    }
  }

  function handleJobEdit(job) {
    setJobData({
      vehicleNumber: job.vehicleNumber,
      serviceType: job.serviceType,
      complaint: job.complaint,
      date: job.date,
      status: job.status,
      cost: job.cost
    });

    setEditJobId(job.id);
    setShowJobForm(true);
  }

  async function handleJobDelete(id) {
    if (!window.confirm("Are you sure you want to delete this job card?")) return;

    try {
      const response = await fetch(`${JOB_API_URL}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setJobs((previous) => previous.filter((job) => job.id !== id));
      alert("Job card deleted successfully!");
    } catch (error) {
      alert("Unable to delete Job Card: " + error.message);
    }
  }

  // STAFF FUNCTIONS

  function handleStaffChange(event) {
    const { name, value } = event.target;

    setStaffData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleStaffSubmit(event) {
    event.preventDefault();

    const duplicate = staff.some(
      (member) =>
        member.mobile === staffData.mobile &&
        String(member.id) !== String(editStaffId)
    );

    if (duplicate) {
      alert("This mobile number is already registered!");
      return;
    }

    const payload = {
      ...staffData,
      salary: Number(staffData.salary || 0)
    };

    try {
      const url = editStaffId ? `${STAFF_API_URL}${editStaffId}/` : STAFF_API_URL;
      const response = await fetch(url, {
        method: editStaffId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(result));

      if (editStaffId) {
        setStaff((previous) =>
          previous.map((member) => member.id === editStaffId ? result : member)
        );
        alert("Staff updated and saved in database!");
      } else {
        setStaff((previous) => [result, ...previous]);
        alert("Staff added and saved in database!");
      }

      setStaffData(emptyStaff);
      setEditStaffId(null);
      setShowStaffForm(false);
    } catch (error) {
      console.error("Staff save error:", error);
      alert("Unable to save Staff: " + error.message);
    }
  }

  function handleStaffEdit(member) {
    setStaffData({
      name: member.name,
      mobile: member.mobile,
      email: member.email,
      role: member.role,
      address: member.address,
      salary: member.salary,
      status: member.status
    });

    setEditStaffId(member.id);
    setShowStaffForm(true);
  }

  async function handleStaffDelete(id) {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const response = await fetch(`${STAFF_API_URL}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setStaff((previous) => previous.filter((member) => member.id !== id));
      alert("Staff deleted successfully!");
    } catch (error) {
      alert("Unable to delete Staff: " + error.message);
    }
  }

  function cancelStaffForm() {
    setShowStaffForm(false);
    setEditStaffId(null);
    setStaffData(emptyStaff);
  }

  // SEARCH FILTERS

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.mobile}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.owner || ""} ${vehicle.number} ${vehicle.brand} ${vehicle.model}`
      .toLowerCase()
      .includes(vehicleSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter((job) =>
    `${job.id} ${job.owner} ${job.vehicleNumber} ${job.serviceType} ${job.status}`
      .toLowerCase()
      .includes(jobSearch.toLowerCase())
  );

  const filteredStaff = staff.filter((member) =>
    `${member.name} ${member.mobile} ${member.role}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase())
  );

  // BILLING, INVENTORY AND REPORTS

  if (["billing", "inventory", "reports"].includes(activePage)) {
    return (
      <OtherModules
        activePage={activePage}
        setActivePage={setActivePage}
        customers={customers}
        vehicles={vehicles}
        jobs={jobs}
        staff={staff}
      />
    );
  }

  // CUSTOMER MANAGEMENT

  if (activePage === "customers") {
    return (
      <main className="dashboard-page">

        <header className="dashboard-header">
          <div>
            <h1>👥 Customer Management</h1>
            <p>Manage all AutoCare garage customers</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Total Customers</h3>
            <h2>{customers.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Add New Customer</h3>
            <p>Register a new garage customer.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setEditId(null);
                setFormData(emptyCustomer);
                setShowForm(true);
              }}
            >
              + Add Customer
            </button>
          </div>

        </div>

        {showForm && (
          <section className="customer-form-section">

            <h2>
              {editId ? "✏️ Edit Customer" : "➕ Add New Customer"}
            </h2>

            <form onSubmit={handleCustomerSubmit}>

              <label>Customer Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleCustomerChange}
                placeholder="Enter customer name"
                required
              />

              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
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
                value={formData.email}
                onChange={handleCustomerChange}
                placeholder="Enter email"
              />

              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleCustomerChange}
                placeholder="Enter address"
              />

              <div className="form-buttons">
                <button type="submit" className="dashboard-button">
                  {editId ? "Update Customer" : "Save Customer"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setFormData(emptyCustomer);
                  }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </section>
        )}

        <section className="customer-list-section">

          <h2>📋 Customer List</h2>

          <input
            className="customer-search"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {filteredCustomers.length === 0 ? (
            <p>
              {customers.length === 0
                ? "No customers added yet."
                : "No matching customers found."}
            </p>
          ) : (
            <div className="customer-table-wrapper">

              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.mobile}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address}</td>

                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(customer)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(customer.id)}
                          >
                            Delete
                          </button>
                        </div>
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

  // VEHICLE MANAGEMENT

  if (activePage === "vehicles") {
    return (
      <main className="dashboard-page">

        <header className="dashboard-header">
          <div>
            <h1>🚘 Vehicle Management</h1>
            <p>Register and manage customer vehicles</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-icon">🚘</div>
            <h3>Total Vehicles</h3>
            <h2>{vehicles.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Register Vehicle</h3>
            <p>Add a customer's vehicle.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setEditVehicleId(null);
                setVehicleData(emptyVehicle);
                setShowVehicleForm(true);
              }}
            >
              + Add Vehicle
            </button>
          </div>

        </div>

        {showVehicleForm && (
          <section className="vehicle-form-section">

            <h2>
              {editVehicleId
                ? "✏️ Edit Vehicle"
                : "🚗 Register New Vehicle"}
            </h2>

            {customers.length === 0 ? (
              <p>
                Please add a customer in Customer Management before registering a vehicle.
              </p>
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

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
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
                  <button type="submit" className="dashboard-button">
                    {editVehicleId ? "Update Vehicle" : "Save Vehicle"}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={cancelVehicleForm}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}
          </section>
        )}

        <section className="vehicle-list-section">

          <h2>📋 Registered Vehicle List</h2>

          <input
            className="customer-search"
            placeholder="Search owner, vehicle number, brand or model..."
            value={vehicleSearch}
            onChange={(event) => setVehicleSearch(event.target.value)}
          />

          {filteredVehicles.length === 0 ? (
            <p>
              {vehicles.length === 0
                ? "No vehicles registered yet."
                : "No matching vehicles found."}
            </p>
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.owner}</td>
                      <td>{vehicle.number}</td>
                      <td>{vehicle.brand}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.type}</td>
                      <td>{vehicle.date}</td>

                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleVehicleEdit(vehicle)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleVehicleDelete(vehicle.id)}
                          >
                            Delete
                          </button>
                        </div>
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

  // SERVICE & JOB CARDS

  if (activePage === "jobs") {
    return (
      <main className="dashboard-page">

        <header className="dashboard-header">
          <div>
            <h1>🛠️ Service & Job Cards</h1>
            <p>Create and manage garage service requests</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-icon">🛠️</div>
            <h3>Total Job Cards</h3>
            <h2>{jobs.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Create Service Job</h3>
            <p>Register a service request for a vehicle.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setEditJobId(null);
                setJobData(emptyJob);
                setShowJobForm(true);
              }}
            >
              + Create Job Card
            </button>
          </div>

        </div>

        {showJobForm && (
          <section className="vehicle-form-section">

            <h2>
              {editJobId ? "✏️ Edit Job Card" : "➕ Create New Job Card"}
            </h2>

            {vehicles.length === 0 ? (
              <p>
                Please register a vehicle in Vehicle Management before creating a job card.
              </p>
            ) : (
              <form onSubmit={handleJobSubmit}>

                <label>Select Vehicle</label>
                <select
                  name="vehicleNumber"
                  value={jobData.vehicleNumber}
                  onChange={handleJobChange}
                  required
                >
                  <option value="">Select registered vehicle</option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.number}
                    >
                      {vehicle.number} - {vehicle.owner} ({vehicle.brand} {vehicle.model})
                    </option>
                  ))}
                </select>

                <label>Service Type</label>
                <select
                  name="serviceType"
                  value={jobData.serviceType}
                  onChange={handleJobChange}
                  required
                >
                  <option value="">Select Service</option>
                  <option value="General Service">General Service</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tyre & Brake Service">Tyre & Brake Service</option>
                  <option value="Battery & Electrical">Battery & Electrical</option>
                  <option value="Other Repair">Other Repair</option>
                </select>

                <label>Customer Complaint / Problem</label>
                <textarea
                  name="complaint"
                  value={jobData.complaint}
                  onChange={handleJobChange}
                  placeholder="Describe vehicle problem"
                  required
                />

                <label>Service Date</label>
                <input
                  type="date"
                  name="date"
                  value={jobData.date}
                  onChange={handleJobChange}
                  required
                />

                <label>Job Status</label>
                <select
                  name="status"
                  value={jobData.status}
                  onChange={handleJobChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <label>Estimated Cost (₹)</label>
                <input
                  type="number"
                  name="cost"
                  min="0"
                  value={jobData.cost}
                  onChange={handleJobChange}
                  placeholder="Enter estimated cost"
                  required
                />

                <div className="form-buttons">
                  <button type="submit" className="dashboard-button">
                    {editJobId ? "Update Job Card" : "Save Job Card"}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowJobForm(false);
                      setEditJobId(null);
                      setJobData(emptyJob);
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}
          </section>
        )}

        <section className="vehicle-list-section">

          <h2>📋 Service Job Card List</h2>

          <input
            className="customer-search"
            placeholder="Search job, owner, vehicle or status..."
            value={jobSearch}
            onChange={(event) => setJobSearch(event.target.value)}
          />

          {filteredJobs.length === 0 ? (
            <p>
              {jobs.length === 0
                ? "No job cards created yet."
                : "No matching job cards found."}
            </p>
          ) : (
            <div className="customer-table-wrapper">

              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Owner</th>
                    <th>Vehicle</th>
                    <th>Service</th>
                    <th>Complaint</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id}>
                      <td>JC-{String(job.id).slice(-6)}</td>
                      <td>{job.owner}</td>
                      <td>{job.vehicleNumber}</td>
                      <td>{job.serviceType}</td>
                      <td>{job.complaint}</td>
                      <td>{job.date}</td>
                      <td>{job.status}</td>
                      <td>₹{job.cost}</td>

                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleJobEdit(job)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleJobDelete(job.id)}
                          >
                            Delete
                          </button>
                        </div>
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

  // STAFF MANAGEMENT

  if (activePage === "staff") {
    return (
      <main className="dashboard-page">

        <header className="dashboard-header">
          <div>
            <h1>👨‍🔧 Staff Management</h1>
            <p>Manage Service Advisors and Mechanics</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Total Staff</h3>
            <h2>{staff.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔧</div>
            <h3>Mechanics</h3>
            <h2>
              {staff.filter((member) => member.role === "Mechanic").length}
            </h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👨‍💼</div>
            <h3>Service Advisors</h3>
            <h2>
              {staff.filter((member) => member.role === "Service Advisor").length}
            </h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">✅</div>
            <h3>Active Staff</h3>
            <h2>
              {staff.filter((member) => member.status === "Active").length}
            </h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Add New Staff</h3>
            <p>Register a new garage employee.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setEditStaffId(null);
                setStaffData(emptyStaff);
                setShowStaffForm(true);
              }}
            >
              + Add Staff
            </button>
          </div>

        </div>

        {showStaffForm && (
          <section className="customer-form-section">

            <h2>
              {editStaffId ? "✏️ Edit Staff" : "➕ Add New Staff"}
            </h2>

            <form onSubmit={handleStaffSubmit}>

              <label>Staff Name</label>
              <input
                name="name"
                value={staffData.name}
                onChange={handleStaffChange}
                placeholder="Enter staff name"
                required
              />

              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={staffData.mobile}
                onChange={handleStaffChange}
                placeholder="10 digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={staffData.email}
                onChange={handleStaffChange}
                placeholder="Enter email address"
                required
              />

              <label>Staff Role</label>
              <select
                name="role"
                value={staffData.role}
                onChange={handleStaffChange}
                required
              >
                <option value="Mechanic">Mechanic</option>
                <option value="Service Advisor">Service Advisor</option>
              </select>

              <label>Address</label>
              <textarea
                name="address"
                value={staffData.address}
                onChange={handleStaffChange}
                placeholder="Enter staff address"
                required
              />

              <label>Monthly Salary (₹)</label>
              <input
                type="number"
                name="salary"
                min="0"
                value={staffData.salary}
                onChange={handleStaffChange}
                placeholder="Enter monthly salary"
                required
              />

              <label>Staff Status</label>
              <select
                name="status"
                value={staffData.status}
                onChange={handleStaffChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="form-buttons">
                <button type="submit" className="dashboard-button">
                  {editStaffId ? "Update Staff" : "Save Staff"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelStaffForm}
                >
                  Cancel
                </button>
              </div>

            </form>
          </section>
        )}

        <section className="vehicle-list-section">

          <h2>📋 Staff List</h2>

          <input
            className="customer-search"
            placeholder="Search staff by name, mobile or role..."
            value={staffSearch}
            onChange={(event) => setStaffSearch(event.target.value)}
          />

          {filteredStaff.length === 0 ? (
            <p>
              {staff.length === 0
                ? "No staff members added yet."
                : "No matching staff found."}
            </p>
          ) : (
            <div className="customer-table-wrapper">

              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.mobile}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.address}</td>
                      <td>₹{member.salary}</td>
                      <td>{member.status}</td>

                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleStaffEdit(member)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleStaffDelete(member.id)}
                          >
                            Delete
                          </button>
                        </div>
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

  // MAIN ADMIN DASHBOARD

  const pageMap = {
    "Customer Management": "customers",
    "Vehicle Management": "vehicles",
    "Service & Job Cards": "jobs",
    "Staff Management": "staff",
    "Billing & Payments": "billing",
    "Spare Parts & Stock": "inventory",
    "Reports": "reports"
  };

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>👑 Admin Dashboard</h1>
          <p>AutoCare Garage Management System</p>
        </div>

        <button
          className="dashboard-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      <div className="dashboard-grid">

        {items.map((item) => (
          <article
            className="dashboard-card"
            key={item.title}
            onClick={() => setActivePage(pageMap[item.title])}
            style={{ cursor: "pointer" }}
          >
            <div className="card-icon">{item.icon}</div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <button
              className="dashboard-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActivePage(pageMap[item.title]);
              }}
            >
              {item.title === "Customer Management" && "Manage Customers →"}
              {item.title === "Vehicle Management" && "Manage Vehicles →"}
              {item.title === "Service & Job Cards" && "Manage Job Cards →"}
              {item.title === "Staff Management" && "Manage Staff →"}
              {item.title === "Billing & Payments" && "Manage Billing →"}
              {item.title === "Spare Parts & Stock" && "Manage Stock →"}
              {item.title === "Reports" && "View Reports →"}
            </button>

          </article>
        ))}

      </div>

    </main>
  );
}