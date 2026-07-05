import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaPiggyBank } from "react-icons/fa";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="home-logo">
          <FaPiggyBank size={26} color="#91c274" />
        </NavLink>
        <NavLink to="/" className="title">
          StockYard
        </NavLink>
        <NavLink to="/markets" className="create-link">
          Markets
        </NavLink>
        {sessionUser && (
          <>
            <NavLink to="/dashboard" className="create-link">
              Dashboard
            </NavLink>
            <NavLink to="/portfolio" className="create-link">
              Portfolio
            </NavLink>
            <NavLink to="/transactions" className="create-link">
              Transactions
            </NavLink>
          </>
        )}
      </div>
      {!isAuthPage && (
        <div className="nav-right">
          {sessionUser ? (
            <ProfileButton user={sessionUser} />
          ) : (
            <>
              <NavLink to="/login" className="auth-link">
                Log In
              </NavLink>
              <NavLink to="/signup" className="auth-link">
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
