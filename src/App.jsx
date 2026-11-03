
import { useState } from "react";
import Login from "./login";
import "./App.css";

import AdminDashboard from "./dashboards/AdminDashboard";
import AdvisorDashboard from "./dashboards/AdvisorDashboard";
import MechanicDashboard from "./dashboards/MechanicDashboard";
import CustomerDashboard from "./dashboards/CustomerDashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Logout: return to Login Page
  function handleLogout() {
    setUserRole("");
    setShowLogin(true);
  }

  // Login success: show dashboard according to role
  function handleLogin(role) {
    setUserRole(role);
    setShowLogin(false);
  }

  // Select dashboard according to role
  function renderDashboard() {
    switch (userRole) {
      case "Admin":
      case "Owner":
        return <AdminDashboard onLogout={handleLogout} />;

      case "Service Advisor":
        return <AdvisorDashboard onLogout={handleLogout} />;

      case "Mechanic":
        return <MechanicDashboard onLogout={handleLogout} />;

      case "Customer":
        return <CustomerDashboard onLogout={handleLogout} />;

      default:
        return (
          <div className="home-page">
            <h2>Invalid Role</h2>
            <p>Please log in again and select a valid role.</p>
            <button
              className="primary-btn"
              onClick={handleLogout}
            >
              Back to Login
            </button>
          </div>
        );
    }
  }

  // Show role-specific dashboard
  if (userRole) {
    return renderDashboard();
  }

  // Show Login Page
  if (showLogin) {
    return (
      <Login
        onBack={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    );
  }

  // Home Page
  return (
    <div className="home-page">
      <div className="topbar">
        <p>📍 AutoCare Garage Management System</p>
        <p>📞 +91 98765 43210</p>
      </div>

      <nav className="navbar">
        <h2 className="logo">🚘 AutoCare</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <button
            className="login-btn"
            onClick={() => setShowLogin(true)}
          >
            Login ↗
          </button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-tag">
            YOUR TRUSTED AUTOMOBILE PARTNER
          </p>

          <h1>
            Professional Care
            <br />
            for Your Vehicle
          </h1>

          <p className="hero-description">
            Reliable vehicle servicing, expert mechanics, and
            hassle-free garage management — all in one place.
          </p>

          <button
            className="primary-btn"
            onClick={() => setShowLogin(true)}
          >
            Book a Service →
          </button>
        </div>
      </section>

      <section className="services-section" id="services">
        <p className="section-tag">WHAT WE DO</p>
        <h2>Our Garage Services</h2>

        <p className="section-description">
          Complete automobile care for your vehicle.
        </p>

        <div className="service-grid">
          <div className="service-card">
            <span>🔧</span>
            <h3>General Servicing</h3>
            <p>
              Routine maintenance and inspection to keep your
              vehicle running smoothly.
            </p>
          </div>

          <div className="service-card">
            <span>⚙️</span>
            <h3>Engine Repair</h3>
            <p>
              Professional engine diagnostics and repair by
              experienced mechanics.
            </p>
          </div>

          <div className="service-card">
            <span>🛞</span>
            <h3>Tyre &amp; Brake Care</h3>
            <p>
              Tyre inspection, brake checking, and safety
              maintenance.
            </p>
          </div>

          <div className="service-card">
            <span>🧰</span>
            <h3>Spare Parts</h3>
            <p>
              Track spare parts and manage inventory for
              efficient garage operations.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div>
          <p className="section-tag">ABOUT AUTOCARE</p>
          <h2>Smart Garage Management</h2>

          <p>
            AutoCare helps manage customers, vehicles, service
            requests, repair progress, mechanics, spare parts,
            and billing in an organized way.
          </p>

          <button
            className="primary-btn"
            onClick={() => setShowLogin(true)}
          >
            Get Started →
          </button>
        </div>

        <div className="about-box">
          <div>✓ Skilled Mechanics</div>
          <div>✓ Organized Service Tracking</div>
          <div>✓ Transparent Billing</div>
          <div>✓ Customer-Focused Service</div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <h2>Need Vehicle Service?</h2>
        <p>Log in to get started with AutoCare.</p>

        <button
          className="primary-btn"
          onClick={() => setShowLogin(true)}
        >
          Login / Get Started
        </button>
      </section>

      <footer className="footer">
        <h2>🚘 AutoCare</h2>
        <p>Smart Garage Management System</p>
        <p>© 2026 AutoCare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
