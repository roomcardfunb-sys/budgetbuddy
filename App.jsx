import { useState } from "react";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
if (showDashboard) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Budget Buddy</h1>

        <button
          onClick={() => setShowDashboard(false)}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome to Your Dashboard 👋</h2>

        <div className="summary-cards">
          <div className="card">
            <h3>Total Income</h3>
            <p>₹0</p>
          </div>

          <div className="card">
            <h3>Total Expense</h3>
            <p>₹0</p>
          </div>

          <div className="card">
            <h3>Balance</h3>
            <p>₹0</p>
          </div>
        </div>

        <div className="expense-box">
          <h2>Add Expense</h2>

          <input
            type="text"
            placeholder="Expense name"
          />

          <input
            type="number"
            placeholder="Amount"
          />

          <button>Add Expense</button>
        </div>
      </main>
    </div>
  );
}
  if (showLogin) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1>Budget Buddy</h1>
          <h2>Welcome Back</h2>

          <input
            type="email"
            placeholder="Enter your email"
          />

          <input
            type="password"
            placeholder="Enter your password"
          />

          <button
  className="login-submit"
  onClick={() => {
    setShowLogin(false);
    setShowDashboard(true);
  }}
>
  Login
</button>
          <button
            className="back-button"
            onClick={() => setShowLogin(false)}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-page">
      <nav className="navbar">
        <h1>Budget Buddy</h1>

        <button
          className="login-button"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <h2>Manage Your Money Easily</h2>

          <p>
            Track your income and expenses.
            Control your budget and save money.
          </p>

          <button
            className="start-button"
            onClick={() => setShowLogin(true)}
          >
            Get Started
          </button>
        </div>
      </main>

      <footer>
        <p>© 2026 Budget Buddy | Expense Tracker</p>
      </footer>
    </div>
  );
}

export default App;