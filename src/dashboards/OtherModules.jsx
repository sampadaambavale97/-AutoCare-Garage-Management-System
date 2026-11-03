
import { useState, useEffect } from "react";
import "./Dashboard.css";

const API_BILLS = "http://127.0.0.1:8000/api/bills/";

const emptyBill = {
  job: "",
  description: "",
  amount: "",
  paid_amount: "0",
  payment_status: "Pending"
};

const emptyPart = {
  name: "",
  partNumber: "",
  category: "Other",
  quantity: "",
  price: "",
  supplier: "",
  minStock: "5"
};

export default function OtherModules({
  activePage,
  setActivePage,
  customers = [],
  vehicles = [],
  jobs = [],
  staff = []
}) {
  // BILLING STATES - Django API database
  const [bills, setBills] = useState([]);
  const [billData, setBillData] = useState(emptyBill);
  const [showBillForm, setShowBillForm] = useState(false);
  const [editBillId, setEditBillId] = useState(null);
  const [billSearch, setBillSearch] = useState("");
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState("");

  async function loadBills() {
    setBillLoading(true);
    setBillError("");
    try {
      const response = await fetch(API_BILLS);
      if (!response.ok) throw new Error(`Bills API error: ${response.status}`);
      const data = await response.json();
      setBills(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      setBillError("Bills load झाले नाहीत. Django server चालू आहे का तपासा.");
      console.error("Load bills error:", error);
    } finally {
      setBillLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
  }, []);

  // INVENTORY STATES
  const [parts, setParts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("autocare_parts") || "[]");
    } catch {
      return [];
    }
  });

  const [partData, setPartData] = useState(emptyPart);
  const [showPartForm, setShowPartForm] = useState(false);
  const [editPartId, setEditPartId] = useState(null);
  const [partSearch, setPartSearch] = useState("");

  // Spare Parts data remains in local storage
  useEffect(() => {
    localStorage.setItem("autocare_parts", JSON.stringify(parts));
  }, [parts]);

  // BILLING FUNCTIONS - Create, update and delete through Django
  function handleBillChange(event) {
    const { name, value } = event.target;
    setBillData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleBillSubmit(event) {
    event.preventDefault();
    setBillError("");

    const payload = {
      job: Number(billData.job),
      description: billData.description.trim(),
      amount: Number(billData.amount),
      paid_amount: Number(billData.paid_amount || 0),
      payment_status: billData.payment_status
    };

    if (!payload.job) {
      alert("Please select a Job Card.");
      return;
    }
    if (payload.paid_amount > payload.amount) {
      alert("Paid amount cannot be greater than total amount.");
      return;
    }

    try {
      const response = await fetch(editBillId ? `${API_BILLS}${editBillId}/` : API_BILLS, {
        method: editBillId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || `HTTP ${response.status}`);
      }
      await loadBills();
      alert(editBillId ? "Bill updated successfully!" : "Bill created successfully!");
      setBillData(emptyBill);
      setEditBillId(null);
      setShowBillForm(false);
    } catch (error) {
      console.error("Save bill error:", error);
      alert("Bill save झाला नाही. Job Card निवडला आहे का आणि Django server चालू आहे का तपासा.\n" + error.message);
    }
  }

  function handleBillEdit(bill) {
    setBillData({
      job: String(bill.job || ""),
      description: bill.description || "",
      amount: String(bill.amount ?? ""),
      paid_amount: String(bill.paid_amount ?? 0),
      payment_status: bill.payment_status || "Pending"
    });
    setEditBillId(bill.id);
    setShowBillForm(true);
  }

  async function handleBillDelete(id) {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      const response = await fetch(`${API_BILLS}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await loadBills();
    } catch (error) {
      console.error("Delete bill error:", error);
      alert("Bill delete झाला नाही. Django server/API तपासा.");
    }
  }

  // INVENTORY FUNCTIONS
  function handlePartChange(event) {
    const { name, value } = event.target;

    setPartData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function handlePartSubmit(event) {
    event.preventDefault();

    const duplicate = parts.some(
      (part) =>
        part.partNumber.toLowerCase() ===
          partData.partNumber.trim().toLowerCase() &&
        part.id !== editPartId
    );

    if (duplicate) {
      alert("This part number already exists!");
      return;
    }

    const part = {
      ...partData,
      id: editPartId || Date.now(),
      quantity: Number(partData.quantity),
      price: Number(partData.price),
      minStock: Number(partData.minStock)
    };

    if (editPartId) {
      setParts((previous) =>
        previous.map((item) =>
          item.id === editPartId ? part : item
        )
      );
      alert("Spare part updated successfully!");
    } else {
      setParts((previous) => [part, ...previous]);
      alert("Spare part added successfully!");
    }

    setPartData(emptyPart);
    setEditPartId(null);
    setShowPartForm(false);
  }

  function handlePartEdit(part) {
    setPartData({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      quantity: String(part.quantity),
      price: String(part.price),
      supplier: part.supplier,
      minStock: String(part.minStock)
    });

    setEditPartId(part.id);
    setShowPartForm(true);
  }

  function handlePartDelete(id) {
    if (window.confirm("Are you sure you want to delete this part?")) {
      setParts((previous) =>
        previous.filter((part) => part.id !== id)
      );
    }
  }

  // SEARCH FILTERS
  const filteredBills = bills.filter((bill) =>
    `${bill.customerName || ""} ${bill.vehicleNumber || ""} ${bill.description || ""} ${bill.payment_status || ""}`
      .toLowerCase()
      .includes(billSearch.toLowerCase())
  );

  const filteredParts = parts.filter((part) =>
    `${part.name} ${part.partNumber} ${part.category} ${part.supplier}`
      .toLowerCase()
      .includes(partSearch.toLowerCase())
  );

  // BILL CALCULATIONS
  const totalBilled = bills.reduce(
    (total, bill) => total + Number(bill.amount || 0),
    0
  );

  const amountPaid = bills.reduce(
    (total, bill) => total + Number(bill.paid_amount || 0),
    0
  );

  const pendingAmount = totalBilled - amountPaid;

  // STOCK CALCULATIONS
  const totalStockQuantity = parts.reduce(
    (total, part) => total + Number(part.quantity || 0),
    0
  );

  const stockValue = parts.reduce(
    (total, part) =>
      total + Number(part.quantity || 0) * Number(part.price || 0),
    0
  );

  const lowStockParts = parts.filter(
    (part) => Number(part.quantity) <= Number(part.minStock)
  );

  // BILLING & PAYMENTS PAGE
  if (activePage === "billing") {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>💳 Billing & Payments</h1>
            <p>Create and manage garage bills and payments</p>
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
            <div className="card-icon">🧾</div>
            <h3>Total Bills</h3>
            <h2>{bills.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Total Billed</h3>
            <h2>₹{totalBilled.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">✅</div>
            <h3>Amount Paid</h3>
            <h2>₹{amountPaid.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⏳</div>
            <h3>Pending Amount</h3>
            <h2>₹{pendingAmount.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Create New Bill</h3>
            <p>Generate a bill for a customer.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setBillData(emptyBill);
                setEditBillId(null);
                setShowBillForm(true);
              }}
            >
              + Create Bill
            </button>
          </div>
        </div>

        {showBillForm && (
          <section className="customer-form-section">
            <h2>{editBillId ? "✏️ Edit Bill" : "➕ Create New Bill"}</h2>
            <form onSubmit={handleBillSubmit}>
              <label>Job Card / Vehicle</label>
              <select name="job" value={billData.job} onChange={handleBillChange} required>
                <option value="">Select Job Card</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    Job #{job.id} - {job.vehicleNumber || `Vehicle ${job.vehicle}`} - {job.owner || "Customer"}
                  </option>
                ))}
              </select>

              <label>Bill Description</label>
              <input
                name="description"
                value={billData.description}
                onChange={handleBillChange}
                placeholder="Example: General Service"
                required
              />

              <label>Total Amount (₹)</label>
              <input
                type="number"
                name="amount"
                min="1"
                step="0.01"
                value={billData.amount}
                onChange={handleBillChange}
                placeholder="Enter total bill amount"
                required
              />

              <label>Paid Amount (₹)</label>
              <input
                type="number"
                name="paid_amount"
                min="0"
                step="0.01"
                value={billData.paid_amount}
                onChange={handleBillChange}
                required
              />

              <label>Payment Status</label>
              <select name="payment_status" value={billData.payment_status} onChange={handleBillChange}>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>

              <div className="form-buttons">
                <button type="submit" className="dashboard-button">
                  {editBillId ? "Update Bill" : "Save Bill"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowBillForm(false);
                    setEditBillId(null);
                    setBillData(emptyBill);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="vehicle-list-section">
          <h2>📋 Bills List</h2>
          <button type="button" className="dashboard-button" onClick={loadBills}>↻ Refresh Bills</button>

          <input
            className="customer-search"
            placeholder="Search customer, vehicle or payment status..."
            value={billSearch}
            onChange={(event) => setBillSearch(event.target.value)}
          />

          {billLoading ? (
            <p>Loading bills...</p>
          ) : billError ? (
            <p>{billError}</p>
          ) : filteredBills.length === 0 ? (
            <p>No bills created yet. Create a bill using an existing Job Card.</p>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Paid Amount</th>
                    <th>Pending</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>BL-{String(bill.id).slice(-6)}</td>
                      <td>{bill.customerName || "-"}</td>
                      <td>{bill.vehicleNumber || "-"}</td>
                      <td>{bill.description}</td>
                      <td>{bill.bill_date || "-"}</td>
                      <td>₹{Number(bill.amount || 0).toLocaleString("en-IN")}</td>
                      <td>₹{Number(bill.paid_amount || 0).toLocaleString("en-IN")}</td>
                      <td>₹{Math.max(0, Number(bill.amount || 0) - Number(bill.paid_amount || 0)).toLocaleString("en-IN")}</td>
                      <td>{bill.payment_status}</td>
                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleBillEdit(bill)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleBillDelete(bill.id)}
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

  // SPARE PARTS & STOCK PAGE
  if (activePage === "inventory") {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>📦 Spare Parts & Stock</h1>
            <p>Manage spare parts and garage inventory</p>
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
            <div className="card-icon">📦</div>
            <h3>Total Parts</h3>
            <h2>{parts.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔢</div>
            <h3>Total Quantity</h3>
            <h2>{totalStockQuantity}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚠️</div>
            <h3>Low Stock Items</h3>
            <h2>{lowStockParts.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Stock Value</h3>
            <h2>₹{stockValue.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">➕</div>
            <h3>Add Spare Part</h3>
            <p>Register a new spare part.</p>

            <button
              className="dashboard-button"
              onClick={() => {
                setPartData(emptyPart);
                setEditPartId(null);
                setShowPartForm(true);
              }}
            >
              + Add Part
            </button>
          </div>
        </div>

        {showPartForm && (
          <section className="customer-form-section">
            <h2>{editPartId ? "✏️ Edit Spare Part" : "➕ Add New Spare Part"}</h2>

            <form onSubmit={handlePartSubmit}>
              <label>Part Name</label>
              <input
                name="name"
                value={partData.name}
                onChange={handlePartChange}
                placeholder="Example: Engine Oil"
                required
              />

              <label>Part Number</label>
              <input
                name="partNumber"
                value={partData.partNumber}
                onChange={handlePartChange}
                placeholder="Enter part number"
                required
              />

              <label>Category</label>
              <select
                name="category"
                value={partData.category}
                onChange={handlePartChange}
              >
                <option value="Engine">Engine</option>
                <option value="Brakes">Brakes</option>
                <option value="Electrical">Electrical</option>
                <option value="Tyres">Tyres</option>
                <option value="Filters">Filters</option>
                <option value="Other">Other</option>
              </select>

              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={partData.quantity}
                onChange={handlePartChange}
                placeholder="Enter available quantity"
                required
              />

              <label>Price per Part (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={partData.price}
                onChange={handlePartChange}
                placeholder="Enter price"
                required
              />

              <label>Supplier Name</label>
              <input
                name="supplier"
                value={partData.supplier}
                onChange={handlePartChange}
                placeholder="Enter supplier name"
                required
              />

              <label>Minimum Stock Alert Quantity</label>
              <input
                type="number"
                name="minStock"
                min="0"
                value={partData.minStock}
                onChange={handlePartChange}
                required
              />

              <div className="form-buttons">
                <button type="submit" className="dashboard-button">
                  {editPartId ? "Update Part" : "Save Part"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowPartForm(false);
                    setEditPartId(null);
                    setPartData(emptyPart);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="vehicle-list-section">
          <h2>📋 Spare Parts List</h2>

          {lowStockParts.length > 0 && (
            <p>
              ⚠️ Low stock alert: {lowStockParts.length} item(s) need restocking.
            </p>
          )}

          <input
            className="customer-search"
            placeholder="Search part name, number or category..."
            value={partSearch}
            onChange={(event) => setPartSearch(event.target.value)}
          />

          {filteredParts.length === 0 ? (
            <p>No spare parts added yet.</p>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Part Name</th>
                    <th>Part Number</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Supplier</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParts.map((part) => (
                    <tr key={part.id}>
                      <td>{part.name}</td>
                      <td>{part.partNumber}</td>
                      <td>{part.category}</td>
                      <td>{part.quantity}</td>
                      <td>₹{part.price}</td>
                      <td>{part.supplier}</td>
                      <td>
                        {part.quantity <= part.minStock
                          ? "⚠️ Low Stock"
                          : "✅ Available"}
                      </td>
                      <td>
                        <div className="form-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handlePartEdit(part)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handlePartDelete(part.id)}
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

  // REPORTS PAGE
  if (activePage === "reports") {
    const completedJobs = jobs.filter(
      (job) => job.status === "Completed"
    ).length;

    const pendingJobs = jobs.filter(
      (job) => job.status === "Pending"
    ).length;

    const progressJobs = jobs.filter(
      (job) => job.status === "In Progress"
    ).length;

    const activeStaff = staff.filter(
      (member) => member.status === "Active"
    ).length;

    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>📊 Garage Reports</h1>
            <p>AutoCare Garage performance overview</p>
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
            <div className="card-icon">🚘</div>
            <h3>Total Vehicles</h3>
            <h2>{vehicles.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🛠️</div>
            <h3>Total Job Cards</h3>
            <h2>{jobs.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👨‍🔧</div>
            <h3>Total Staff</h3>
            <h2>{staff.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🧾</div>
            <h3>Total Bills</h3>
            <h2>{bills.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Total Revenue Paid</h3>
            <h2>₹{amountPaid.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⏳</div>
            <h3>Pending Payments</h3>
            <h2>₹{pendingAmount.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📦</div>
            <h3>Total Spare Parts</h3>
            <h2>{parts.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💎</div>
            <h3>Stock Value</h3>
            <h2>₹{stockValue.toLocaleString("en-IN")}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚠️</div>
            <h3>Low Stock Items</h3>
            <h2>{lowStockParts.length}</h2>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">✅</div>
            <h3>Active Staff</h3>
            <h2>{activeStaff}</h2>
          </div>
        </div>

        <section className="vehicle-list-section">
          <h2>🛠️ Job Card Status Report</h2>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Pending Jobs</h3>
              <h2>{pendingJobs}</h2>
            </div>

            <div className="dashboard-card">
              <h3>In Progress Jobs</h3>
              <h2>{progressJobs}</h2>
            </div>

            <div className="dashboard-card">
              <h3>Completed Jobs</h3>
              <h2>{completedJobs}</h2>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return null;
}
