import { useEffect, useState } from "react";
import "./App.css";
import "./HomePage.css";
import Dashboard from "./Dashboard";
import AuthPage from "./AuthPage";
import { apiRequest, clearSession, getSessionToken } from "./api";

function App() {
  const hasResetToken = new URLSearchParams(window.location.search).has("reset");
  const [screen, setScreen] = useState(() => hasResetToken ? "auth" : getSessionToken() ? "loading" : "home");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    if (hasResetToken || !getSessionToken()) return () => { active = false; };
    apiRequest("/auth/me")
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        setScreen("dashboard");
      })
      .catch(() => {
        clearSession();
        if (active) setScreen("home");
      });
    return () => { active = false; };
  }, []);

  async function logout() {
    try { await apiRequest("/auth/logout", { method: "POST" }); } catch { /* Expired sessions are cleared locally too. */ }
    clearSession();
    setUser(null);
    setScreen("home");
  }

  if (screen === "loading") return <div className="auth-loading" role="status">Loading your account…</div>;
  if (screen === "dashboard") return <Dashboard user={user} onLogout={logout} />;
  if (screen === "auth") return <AuthPage onBack={() => setScreen("home")} onAuthenticated={(currentUser) => { setUser(currentUser); setScreen("dashboard"); }} />;

  return <HomePage onOpenDashboard={() => setScreen("auth")} />;
}

function HomePage({ onOpenDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    if (!showHowItWorks) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowHowItWorks(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showHowItWorks]);

  return (
    <div className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#home" aria-label="Budget Vision home">
          <span className="home-brand-mark">₹</span>
          <span>Budget Vision</span>
        </a>

        <button
          className="home-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`home-menu${menuOpen ? " is-open" : ""}`}>
          <button type="button" onClick={() => { setMenuOpen(false); setShowHowItWorks(true); }}>See how it works</button>
        </nav>
      </header>

      <main id="home">
        <section className="home-hero">
          <div className="hero-decoration hero-decoration-one" />
          <div className="hero-decoration hero-decoration-two" />
          <div className="hero-copy">
            <p className="hero-kicker">A clearer picture of your money</p>
            <h1>Money management,<br /><strong>made simple.</strong></h1>
            <p className="hero-description">
              Keep your income, expenses and budget together in one calm,
              easy-to-use place.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" type="button" onClick={onOpenDashboard}>
                Get started <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="hero-note"><span>✓</span> Free to use · Your records stay with your account</div>
          </div>

          <div className="phone-scene" aria-label="Preview of the Budget Vision dashboard">
            <div className="phone-orbit orbit-one" />
            <div className="phone-orbit orbit-two" />
            <div className="phone phone-back phone-back-left">
              <div className="phone-notch" />
              <span className="phone-tiny-label">Monthly spend</span>
              <strong>₹18,420</strong>
              <div className="mini-bars"><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="phone phone-main">
              <div className="phone-notch" />
              <div className="phone-topline"><span>Good morning</span><b>●</b></div>
              <h2>Your balance</h2>
              <strong className="phone-balance">₹42,580</strong>
              <div className="phone-chart"><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="phone-chart-labels"><span>Mon</span><span>Sun</span></div>
              <div className="phone-transactions-title">Recent activity</div>
              <div className="phone-transaction"><i className="tx-icon coral">↗</i><span>Groceries<small>Today</small></span><b>−₹850</b></div>
              <div className="phone-transaction"><i className="tx-icon peach">↙</i><span>Monthly salary<small>Yesterday</small></span><b>+₹32,000</b></div>
            </div>
            <div className="phone phone-back phone-back-right">
              <div className="phone-notch" />
              <span className="phone-tiny-label">Budget used</span>
              <div className="donut"><span>68%</span></div>
              <div className="donut-caption">This month</div>
            </div>
            <span className="float-dot dot-a" /><span className="float-dot dot-b" />
          </div>
        </section>

      </main>
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} onOpenDashboard={onOpenDashboard} />}
    </div>
  );
}

function HowItWorksModal({ onClose, onOpenDashboard }) {
  return (
    <div className="how-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="how-section how-modal" role="dialog" aria-modal="true" aria-labelledby="how-title">
        <button className="how-close" type="button" aria-label="Close how it works" onClick={onClose}>×</button>
        <div className="how-heading">
          <p>HOW IT WORKS</p>
          <h2 id="how-title">A clearer money routine in three simple steps</h2>
          <span>Keep everything organized and see where your money is going.</span>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <span className="how-step">01</span>
            <div className="how-icon">↗</div>
            <h3>Record income and expenses</h3>
            <p>Add an amount, category, and date whenever money comes in or goes out.</p>
          </article>
          <article className="how-card">
            <span className="how-step">02</span>
            <div className="how-icon">◉</div>
            <h3>Set your monthly budget</h3>
            <p>Choose a spending limit and keep an eye on how much is left.</p>
          </article>
          <article className="how-card">
            <span className="how-step">03</span>
            <div className="how-icon">▤</div>
            <h3>Review your progress</h3>
            <p>Use your dashboard and monthly analysis to understand your money habits.</p>
          </article>
        </div>
        <div className="how-cta">
          <span>Ready to get a clearer picture?</span>
          <button type="button" onClick={() => { onClose(); onOpenDashboard(); }}>Get started <b>→</b></button>
        </div>
      </section>
    </div>
  );
}

export default App;
