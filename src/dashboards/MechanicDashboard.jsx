
import { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

const API = "http://127.0.0.1:8000/api";

const items = [
  ["🔧", "My Assigned Jobs", "View repair jobs assigned to you.", "jobs"],
  ["🚘", "Vehicle Details", "Check vehicle and reported problem details.", "vehicles"],
  ["📝", "Repair Instructions", "Review the work required for each job.", "instructions"],
  ["⚙️", "Work Status", "Update repair progress.", "status"],
  ["✅", "Completed Jobs", "Review your completed repair work.", "completed"]
];

const getList = (data) =>
  Array.isArray(data) ? data : data.results || [];

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data === "object"
        ? Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("\n")
        : "Request failed"
    );
  }

  return data;
}

export default function MechanicDashboard({ onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [activePage, setActivePage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/jobs/`);
      const data = await readResponse(response);

      setJobs(getList(data));
    } catch (err) {
      setError(err.message || "Unable to load job cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const getVehicle = (job) =>
    job.vehicleNumber ||
    job.vehicle_number ||
    (typeof job.vehicle === "object" ? job.vehicle?.number : "") ||
    "N/A";

  const getOwner = (job) =>
    job.owner ||
    job.customerName ||
    "N/A";

  const getService = (job) =>
    job.serviceType ||
    job.service_type ||
    "N/A";

  const getCost = (job) =>
    job.cost ?? job.estimated_cost ?? 0;

  const getStatus = (job) =>
    job.status || "Pending";

  const updateStatus = async (jobId, newStatus) => {
    try {
      setUpdatingId(jobId);
      setError("");
      setSuccess("");

      const response = await fetch(`${API}/jobs/${jobId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      await readResponse(response);

      setSuccess(`Job #${jobId} status updated to ${newStatus}.`);
      await fetchJobs();
    } catch (err) {
      setError(err.message || "Unable to update job status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingJobs = jobs.filter(
    job => getStatus(job) === "Pending"
  );

  const progressJobs = jobs.filter(
    job => getStatus(job) === "In Progress"
  );

  const completedJobs = jobs.filter(
    job => getStatus(job) === "Completed"
  );

  const getPageJobs = () => {
    if (activePage === "completed") return completedJobs;
    if (activePage === "status") return jobs;
    return jobs;
  };

  const pageTitle = {
    jobs: "🔧 My Assigned Jobs",
    vehicles: "🚘 Vehicle Details",
    instructions: "📝 Repair Instructions",
    status: "⚙️ Work Status",
    completed: "✅ Completed Jobs"
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <h2>Loading Mechanic Dashboard...</h2>
      </main>
    );
  }

  if (activePage) {
    const visibleJobs = getPageJobs();

    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>{pageTitle[activePage]}</h1>
            <p>Repair and job card information</p>
          </div>

          <button
            className="dashboard-button"
            onClick={() => setActivePage("")}
          >
            ← Back to Dashboard
          </button>
        </header>

        {error && (
          <section className="customer-form-section">
            <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>
          </section>
        )}

        {success && (
          <section className="customer-form-section">
            <p style={{ color: "green" }}>{success}</p>
          </section>
        )}

        {visibleJobs.length === 0 ? (
          <section className="customer-form-section">
            <h2>No Job Cards Available</h2>
            <p>There are no records in this section yet.</p>
          </section>
        ) : (
          <div className="dashboard-grid">
            {visibleJobs.map(job => (
              <article className="dashboard-card" key={job.id}>
                <div className="card-icon">🔧</div>

                <h3>Job #{job.id}</h3>

                {(activePage === "jobs" ||
                  activePage === "vehicles" ||
                  activePage === "instructions" ||
                  activePage === "status" ||
                  activePage === "completed") && (
                  <>
                    <p><strong>Customer:</strong> {getOwner(job)}</p>
                    <p><strong>Vehicle:</strong> {getVehicle(job)}</p>
                    <p><strong>Service:</strong> {getService(job)}</p>
                    <p><strong>Complaint:</strong> {job.complaint || "N/A"}</p>
                    <p><strong>Date:</strong> {job.date || "N/A"}</p>
                    <p><strong>Estimated Cost:</strong> ₹{getCost(job)}</p>
                    <p><strong>Status:</strong> {getStatus(job)}</p>
                  </>
                )}

                {activePage === "instructions" && (
                  <p>
                    <strong>Repair Instructions:</strong>{" "}
                    {job.complaint || "No repair instructions available."}
                  </p>
                )}

                {activePage === "status" && (
                  <>
                    <label>Update Work Status</label>
                    <select
                      value={getStatus(job)}
                      disabled={updatingId === job.id}
                      onChange={e => updateStatus(job.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    {updatingId === job.id && <p>Updating...</p>}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>🔧 Mechanic Dashboard</h1>
          <p>Your assigned repairs and daily work</p>
        </div>

        <button className="dashboard-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      {error && (
        <section className="customer-form-section">
          <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>
          <button className="dashboard-button" onClick={fetchJobs}>
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
          <div className="card-icon">🔧</div>
          <h3>Total Jobs</h3>
          <h2>{jobs.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">⏳</div>
          <h3>Pending Jobs</h3>
          <h2>{pendingJobs.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">⚙️</div>
          <h3>In Progress</h3>
          <h2>{progressJobs.length}</h2>
        </article>

        <article className="dashboard-card">
          <div className="card-icon">✅</div>
          <h3>Completed Jobs</h3>
          <h2>{completedJobs.length}</h2>
        </article>
      </div>

      <div className="dashboard-grid">
        {items.map(([icon, title, description, page]) => (
          <article className="dashboard-card" key={page}>
            <div className="card-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button
              className="dashboard-button"
              onClick={() => {
                setSuccess("");
                setError("");
                setActivePage(page);
              }}
            >
              View Details →
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
