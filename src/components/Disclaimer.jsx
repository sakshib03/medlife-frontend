// Disclaimer.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./css_files/Disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();

  const handleAgree = () => {
    localStorage.setItem("disclaimerAccepted", "true");
    navigate("/dashboard");
  };

  const handleCancel = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("showDisclaimer");
    navigate("/");
  };

  return (
    <div className="disclaimer-container">
      <div className="disclaimer-content">
        <h1>Disclaimer</h1>
        <p>
          All information in this application is provided solely to demonstrate how AI can be used in healthcare. 
          This information is sourced from AI engines like ChatGPT. None of the information has been validated 
          or approved by a healthcare professional. Please use this information only after consulting and upon 
          the advice of a healthcare professional.
        </p>
        <div className="disclaimer-buttons">
          <button className="agree-btn" onClick={handleAgree}>Agree</button>
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;