import "./App.css";

function Login({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Budget Buddy</h1>
        <h1>Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
        />

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button onClick={onLogin}>Login</button>

        <p style={{ marginTop: "15px" }}>
          Don't have an account? <a href="#">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
