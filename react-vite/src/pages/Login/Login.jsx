import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { FaChartLine } from "react-icons/fa6";
import { thunkLogin } from "../../redux/session";
import "./Login.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (sessionUser) return <Navigate to="/dashboard" replace />;

  const login = async (credentials) => {
    setSubmitting(true);
    const result = await dispatch(thunkLogin(credentials));
    setSubmitting(false);
    if (result) {
      setErrors(result);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <FaChartLine size={22} color="#f0b90b" />
        <h1>Log in to StockYard</h1>
        <p className="auth-subtitle">Welcome back. Trade with your $100,000 paper balance.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          {errors.server && <p className="error-text">{errors.server}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            Log In
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%" }}
          disabled={submitting}
          onClick={() => login({ email: "demo@aa.io", password: "password" })}
        >
          Log in as Demo
        </button>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
