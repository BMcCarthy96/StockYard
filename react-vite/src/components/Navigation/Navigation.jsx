import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaChartLine } from "react-icons/fa6";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const navLinkClass = ({ isActive }) => `create-link${isActive ? " active" : ""}`;
  const sessionLinkClass = ({ isActive }) => `create-link session-only${isActive ? " active" : ""}`;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="home-logo">
          <FaChartLine size={22} color="#f0b90b" />
        </NavLink>
        <NavLink to="/" className="title">
          StockYard
        </NavLink>
        <div className="nav-links">
          <NavLink to="/markets" className={navLinkClass}>
            Markets
          </NavLink>
          {sessionUser && (
            <>
              <NavLink to="/dashboard" className={sessionLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/portfolio" className={sessionLinkClass}>
                Portfolio
              </NavLink>
              <NavLink to="/transactions" className={sessionLinkClass}>
                Transactions
              </NavLink>
            </>
          )}
        </div>
      </div>
      {!isAuthPage && (
        <div className="nav-right">
          {sessionUser ? (
            <ProfileButton user={sessionUser} />
          ) : (
            <>
              <NavLink to="/login" className="auth-link login-link">
                Log In
              </NavLink>
              <NavLink to="/signup" className="auth-link signup-link">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
