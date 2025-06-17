import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon, FaCog, FaUsers } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className={`navbar ${theme}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="logo-text">
            <span>Student Progress Management</span>
          </div>
        </Link>

        <div className="navbar-links">
          <Link
            to="/students"
            className={`nav-link ${
              location.pathname.includes("/students") ? "active" : ""
            }`}
          >
            <FaUsers /> <span className="nav-text">Students</span>
          </Link>

          <Link
            to="/settings"
            className={`nav-link ${
              location.pathname === "/settings" ? "active" : ""
            }`}
          >
            <FaCog /> <span className="nav-text">Settings</span>
          </Link>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={
              theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            }
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
