import { useState } from "react";
import { apiRequest, saveSession } from "./api";
import "./HomePage.css";

function AuthPage({ onAuthenticated, onBack }) {
  const resetToken = new URLSearchParams(window.location.search).get("reset") || "";
  const [mode, setMode] = useState(() => resetToken ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const isLogin = mode === "login";

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (isForgot) {
        const result = await apiRequest("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        setNotice(result.message);
        return;
      }
      if (isReset) {
        if (password !== confirmPassword) {
          setError("The passwords do not match.");
          return;
        }
        const result = await apiRequest("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token: resetToken, password }),
        });
        window.history.replaceState({}, "", window.location.pathname);
        setPassword("");
        setConfirmPassword("");
        setMode("login");
        setNotice(result.message);
        return;
      }
      const session = await apiRequest(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ ...(isRegister ? { name, legacyOwnerId: localStorage.getItem("budget-buddy-profile") } : {}), email, password }),
      });
      saveSession(session);
      if (isRegister) localStorage.removeItem("budget-buddy-profile");
      onAuthenticated(session.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <button className="auth-back" type="button" onClick={onBack}>← Back to Budget Vision</button>
        <div className="auth-brand-mark">₹</div>
        <p className="auth-kicker">YOUR MONEY, IN ONE PLACE</p>
        <h1 id="auth-title">{isRegister ? "Create your account" : isForgot ? "Reset your password" : isReset ? "Choose a new password" : "Welcome back"}</h1>
        <p className="auth-description">{isRegister ? "Start organizing your income, expenses and budget." : isForgot ? "Enter your email and we’ll send you a password reset link." : isReset ? "Choose a new password for your account." : "Sign in to continue to your Money Manager."}</p>

        {!isForgot && !isReset && <div className="auth-tabs" role="tablist" aria-label="Account options">
          <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? "active" : ""} onClick={() => changeMode("login")}>Login</button>
          <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? "active" : ""} onClick={() => changeMode("register")}>Register</button>
        </div>}

        <form className="auth-form" onSubmit={submit}>
          {isRegister && <label>Full name<input autoComplete="name" type="text" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required placeholder="Your name" /></label>}
          {!isReset && <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" /></label>}
          {!isForgot && <label>Password<input autoComplete={isLogin ? "current-password" : "new-password"} type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isLogin ? undefined : 8} maxLength={128} required placeholder={isLogin ? "Enter your password" : "At least 8 characters"} /></label>}
          {isReset && <label>Confirm new password<input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={128} required placeholder="Re-enter your new password" /></label>}
          {isLogin && <button className="auth-forgot" type="button" onClick={() => changeMode("forgot")}>Forgot password?</button>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : isForgot ? "Send reset link" : isReset ? "Reset password" : "Login"}<span aria-hidden="true">→</span></button>
        </form>
        {isForgot || isReset ? <p className="auth-switch"><button type="button" onClick={() => changeMode("login")}>← Back to login</button></p> : <p className="auth-switch">{isRegister ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={() => changeMode(isRegister ? "login" : "register")}>{isRegister ? "Login" : "Register"}</button></p>}
        <p className="auth-security">Your account keeps your financial records private.</p>
      </section>
    </main>
  );
}

export default AuthPage;
