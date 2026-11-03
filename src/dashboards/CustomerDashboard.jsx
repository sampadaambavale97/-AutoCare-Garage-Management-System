
import { useState, useEffect } from "react";
import "./Dashboard.css";

const API = "http://127.0.0.1:8000/api";

const items = [
  ["🚘", "My Vehicles", "View your registered vehicles.", "vehicles"],
  ["📅", "My Service Requests", "Review your service requests.", "requests"],
  ["🔍", "Repair Status", "Check your vehicle's repair progress.", "status"],
  ["📜", "Service History", "Review previous vehicle services.", "history"],
  ["💳", "My Bills", "View your bills and payment information.", "bills"]
];

const getId = (value) => {
  if (value && typeof value === "object") return value.id;
  return value;
};

const getVehicleNumber = (job, vehicles) => {
  const vehicleId = getId(job.vehicle);
  const vehicle = vehicles.find(v => String(v.id) === String(vehicleId));
  return vehicle?.number || job.vehicle?.number || "N/A";
};

const getList = (data) =>
  Array.isArray(data) ? data : data.results || [];

export default function CustomerDashboard({ onLogout, customerId }) {
  const [activePage, setActivePage] = useState("");
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [customerRes, vehicleRes, jobRes, billRes] =
          await Promise.all([
            fetch(`${API}/customers/`),
            fetch(`${API}/vehicles/`),
            fetch(`${API}/jobs/`),
            fetch(`${API}/bills/`)
          ]);

        if (
          !customerRes.ok ||
          !vehicleRes.ok ||
          !jobRes.ok ||
          !billRes.ok
        ) {
          throw new Error("Unable to load records from Django.");
        }

        const [customerData, vehicleData, jobData, billData] =
          await Promise.all([
            customerRes.json(),
            vehicleRes.json(),
            jobRes.json(),
            billRes.json()
          ]);

        setCustomers(getList(customerData));
        setVehicles(getList(vehicleData));
        setJobs(getList(jobData));
        setBills(getList(billData));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCustomer = customerId
    ? customers.find(c => String(c.id) === String(customerId))
    : null;

  const myVehicles = customerId
    ? vehicles.filter(v =>
        String(getId(v.customer)) === String(customerId)
      )
    : vehicles;

  const myVehicleIds = myVehicles.map(v => String(v.id));

  const myJobs = jobs.filter(job =>
    myVehicleIds.includes(String(getId(job.vehicle)))
  );

  const myJobIds = myJobs.map(job => String(job.id));

  const myBills = bills.filter(bill =>
    myJobIds.includes(String(getId(bill.job)))
  );

  const pageDetails = {
    vehicles: {
      title: "🚘 My Vehicles",
      description: "Your registered vehicles",
      columns: ["Vehicle Number", "Brand", "Model", "Type", "Date"],
      rows: myVehicles.map(v => [
        v.number, v.brand, v.model, v.type, v.date
      ])
    },

    requests: {
      title: "📅 My Service Requests",
      description: "Your service requests",
      columns: ["Request ID", "Vehicle", "Service", "Date", "Status"],
      rows: myJobs.map(j => [
        `JOB-${j.id}`,
        getVehicleNumber(j, myVehicles),
        j.service_type || j.serviceType,
        j.date,
        j.status
      ])
    },

    status: {
      title: "🔍 Repair Status",
      description: "Current repair progress",
      columns: ["Vehicle", "Service", "Current Status"],
      rows: myJobs.map(j => [
        getVehicleNumber(j, myVehicles),
        j.service_type || j.serviceType,
        j.status
      ])
    },

    history: {
      title: "📜 Service History",
      description: "Completed vehicle services",
      columns: ["Date", "Vehicle", "Service", "Amount"],
      rows: myJobs
        .filter(j => j.status === "Completed")
        .map(j => [
          j.date,
          getVehicleNumber(j, myVehicles),
          j.service_type || j.serviceType,
          `₹${j.estimated_cost ?? j.cost ?? 0}`
        ])
    },

    bills: {
      title: "💳 My Bills",
      description: "Your bills and payment information",
      columns: [
        "Bill ID",
        "Date",
        "Vehicle",
        "Description",
        "Total Amount",
        "Paid Amount",
        "Pending Amount",
        "Payment Status"
      ],
      rows: myBills.map(b => {
        const total = Number(b.amount || 0);
        const paid = Number(b.paid_amount || 0);
        const pending = Math.max(total - paid, 0);

        const relatedJob = myJobs.find(
          j => String(j.id) === String(getId(b.job))
        );

        return [
          `BILL-${b.id}`,
          b.bill_date || "N/A",
          b.vehicleNumber ||
            (relatedJob
              ? getVehicleNumber(relatedJob, myVehicles)
              : "N/A"),
          b.description,
          `₹${total.toFixed(2)}`,
          `₹${paid.toFixed(2)}`,
          `₹${pending.toFixed(2)}`,
          b.payment_status || "Pending"
        ];
      })
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <h2>Loading Customer Records...</h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <h2>Unable to load records</h2>
        <p>{error}</p>
        <button className="dashboard-button" onClick={onLogout}>
          Logout
        </button>
      </main>
    );
  }

  if (activePage) {
    const page = pageDetails[activePage];

    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <section className="customer-form-section">
          <h2>{page.title}</h2>

          {activePage === "bills" && (
            <p>
              Total Bills: {myBills.length}
            </p>
          )}

          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  {page.columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {page.rows.length > 0 ? (
                  page.rows.map((row, index) => (
                    <tr key={index}>
                      {row.map((value, i) => (
                        <td key={i}>{value ?? "N/A"}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={page.columns.length}>
                      No records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>🚗 Customer Dashboard</h1>
          <p>Your vehicles and service information</p>

          {selectedCustomer && (
            <p>Welcome, {selectedCustomer.name}</p>
          )}

          {!customerId && (
            <p>Demo view: showing all customer records.</p>
          )}
        </div>

        <button className="dashboard-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-grid">
        {items.map(([icon, title, description, page]) => (
          <article className="dashboard-card" key={page}>
            <div className="card-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>

            <button
              className="dashboard-button"
              onClick={() => setActivePage(page)}
            >
              View Details →
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
