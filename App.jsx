import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const handleLogout = () => {
  setShowDashboard(false);
  setShowLogin(false);
};

 if (showDashboard) {
  return <Dashboard onLogout={handleLogout} />;
}

if (showLogin) {
  return (
    <Login
      onLogin={() => {
        setShowLogin(false);
        setShowDashboard(true);
      }}
    />
  );
}

  return (
    <>
      <header className="dashboard-header">
        <h1>Budget Buddy</h1>

        <nav className="navbar">
          <a href="#">Home</a>

          <button onClick={() => setShowLogin(true)}>
            Login
          </button>

          <a href="#">Help</a>
        </nav>
      </header>

      <div className="dashboard">
        <h2>Welcome to Budget Buddy 👋</h2>

        <p>
          Track your income and expenses easily.
          <br />
          Manage your personal finance in one place.
        </p>

        <br />

        <button
          className="start-btn"
          onClick={() => setShowLogin(true)}
        >
          Get Started
        </button>
      </div>
    </>
  );
}

export default App;