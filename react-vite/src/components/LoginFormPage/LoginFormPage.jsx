import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginForm.css";

const countryOptions = [
  { code: "+1", name: "United States" },
  { code: "+93", name: "Afghanistan" },
  { code: "+44", name: "United Kingdom" },
  { code: "+91", name: "India" },
  { code: "+213", name: "Algeria" },
  { code: "+61", name: "Australia" },
  { code: "+43", name: "Austria" },
  { code: "+32", name: "Belgium" },
  { code: "+55", name: "Brazil" },
  { code: "+359", name: "Bulgaria" },
  { code: "+1", name: "Canada" },
  { code: "+86", name: "China" },
  { code: "+57", name: "Colombia" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+20", name: "Egypt" },
  { code: "+33", name: "France" },
  { code: "+49", name: "Germany" },
  { code: "+30", name: "Greece" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+60", name: "Malaysia" },
  { code: "+52", name: "Mexico" },
  { code: "+31", name: "Netherlands" },
  { code: "+64", name: "New Zealand" },
  { code: "+47", name: "Norway" },
  { code: "+92", name: "Pakistan" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+65", name: "Singapore" },
  { code: "+27", name: "South Africa" },
  { code: "+34", name: "Spain" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+90", name: "Turkey" },
  { code: "+971", name: "UAE" },
  { code: "+380", name: "Ukraine" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+260", name: "Zambia" },
  { code: "+263", name: "Zimbabwe" },
];

function LoginFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = isEmailLogin ? email : `${phone}@demo.com`;
    const serverResponse = await dispatch(thunkLogin({ email: identifier, password }));

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  const handleDemoLogin = async (email, password) => {
    const data = await dispatch(thunkLogin({ email, password }));
    if (data) {
      setErrors(data);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <div className="left-pane">
        <div className="intro-text">
          <h2>Start Trading with StockYard</h2>
          <p>Invest in Stocks, ETFs, Futures & More.</p>
          <p>Zero commissions on eligible trades*</p>
          <p style={{ fontSize: "0.75rem", marginTop: "10px" }}>
            *Exchange and regulatory fees may apply. See our pricing page for details.
            <br />
            *Options trading involves risk and may result in losses exceeding your initial investment.
            Learn more at our Policy Center.
          </p>
          <img
      // src="https://miro.medium.com/v2/resize:fit:800/0*ZsP_ceihYyp14CNx.jpg"
      src="https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1350&q=80"
      alt="Stock market illustration"
    />
        </div>
      </div>
      <div className="right-pane">
        <div className="auth-card">
          <h1 className="auth-title">Log in to StockYard</h1>
          <div className="simple-toggle">
            <span className="current-option">
              {isEmailLogin ? "Email Login" : "Phone Login"}
            </span>
            <span className="switch-option" onClick={() => setIsEmailLogin(!isEmailLogin)}>
              {isEmailLogin ? "Phone Login" : "Email Login"}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {isEmailLogin ? (
              <>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </>
            ) : (
              <div className="input-with-dropdown">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {countryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} {option.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}

            <label htmlFor="Password">Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ?  <FaEye />: <FaEyeSlash />}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <button type="submit">Log In</button>

            <div className="demo-button">
              <button onClick={() => handleDemoLogin("demo@aa.io", "password")}>
                Log in as Demo
              </button>
            </div>

            <div className="forgot-links">
              <p onClick={() => navigate("/signup")}>Forgot Password?</p>
              <p onClick={() => navigate("/signup")}>Forgot Username?</p>
            </div>

            <p className="signup-prompt">
              <Link to="/signup">Sign up</Link> or log in with
            </p>

            <div className="social-buttons">
              <button
                type="button"
                className="social-button facebook"
                onClick={() => navigate("/signup")}
              >
                <FaFacebookF /> Facebook
              </button>
              <button
                type="button"
                className="social-button google"
                onClick={() => navigate("/signup")}
              >
                <FcGoogle /> Google
              </button>
            </div>

            <div className="demo-logins">
              <p>Try a Demo User:</p>
              <button type="button" onClick={() => handleDemoLogin("demo@aa.io")}>Demo</button>
              <button type="button" onClick={() => handleDemoLogin("marnie@aa.io")}>Marnie</button>
              <button type="button" onClick={() => handleDemoLogin("bobbie@aa.io")}>Bobbie</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginFormPage;
