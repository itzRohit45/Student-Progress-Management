import React from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="button button-primary">
          <FaHome /> Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
