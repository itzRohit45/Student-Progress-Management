import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "./Footer.css";

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${theme}`}>
      <div className="footer-container">
        <p>&copy; {currentYear} Student Progress Management System</p>
        <p className="version">Version 1.0.0</p>
      </div>
    </footer>
  );
};

export default Footer;
