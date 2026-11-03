
import { useState } from "react";
import "./login.css";

function Login({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    // Demo login: show dashboard for selected role
    onLogin(role);
  }

  return (
    <main className="login-page">
      <button
        type="button"
        className="back-home"
        onClick={onBack}
      >
        ← Back to Home
      </button>

      <section className="login-card">
        <div className="login-icon">🚘</div>

        <h3>Welcome to AutoCare</h3>

        <p className="login-subtitle">
          Garage Management System
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <div className="password-box">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="role">Login As</label>

          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="Customer">Customer</option>
            <option value="Admin">Admin / Owner</option>
            <option value="Service Advisor">Service Advisor</option>
            <option value="Mechanic">Mechanic</option>
          </select>

          <button type="submit" className="login-submit">
            Login →
          </button>
        </form>

        <p className="login-note">
          Demo login — authentication will be added later.
        </p>
      </section>
    </main>
  );
}

export default Login;
