import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { thunkLogout } from "../../redux/session";
import { HiBars3 } from "react-icons/hi2";
import "./ProfileButton.css";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = async (e) => {
    e.preventDefault();
    await dispatch(thunkLogout());
    closeMenu();
    navigate("/");
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button onClick={toggleMenu} className="profile-button">
        <div className="menu">
          <HiBars3 size={30} />
        </div>
        <div className="user">
          <FaUserCircle size={30} />
        </div>
      </button>

      <ul className={ulClassName} ref={ulRef}>
        <div className="options">
          <div>Hello, {user.username}</div>
          <div>{user.email}</div>
          <div>${user.cash_balance.toFixed(2)} cash</div>
        </div>
        <hr />
        {/* Only visible on mobile widths (see .dropdown-nav-links CSS) — the
            navbar's own links cover this on desktop. */}
        <div className="dropdown-nav-links">
          <NavLink to="/markets" onClick={closeMenu}>Markets</NavLink>
          <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
          <NavLink to="/portfolio" onClick={closeMenu}>Portfolio</NavLink>
          <NavLink to="/transactions" onClick={closeMenu}>Transactions</NavLink>
          <hr />
        </div>
        <div className="logout-button-div">
          <button className="logout-button" onClick={logout}>
            Log Out
          </button>
        </div>
      </ul>
    </>
  );
}

export default ProfileButton;
