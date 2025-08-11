import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./css_files/Dashboard.css";

const DeleteMember = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { member, email } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!member || !email) {
      navigate("/medlife/dashboard");
    }
  }, [member, email, navigate]);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const memberName = `${member.firstName},${member.lastName}`;
      
      const response = await fetch(
        `http://localhost:8000/medlife/removemember?email=${encodeURIComponent(email)}&member_name=${encodeURIComponent(memberName)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete member");
      }

      alert("Member deleted successfully!");
      navigate("/medlife/dashboard");
      
    } catch (err) {
      setError(err.message || "An error occurred while deleting the member");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/medlife/dashboard");
  };

  if (!member) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header>
        <div className="header-left">
          <img 
            src={require("../assets/v987-18a-removebg-preview.png")} 
            alt="MedLife AI Logo" 
            className="logo" 
          />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
      </header>

      <div className="dashboard-container" style={{ padding: "2rem" }}>
        <div className="main-sidecontainer">
          <div className="table-container">
            <h1 className="dashboard-title">Confirm Member Deletion</h1>
            
            {error && (
              <div style={{ color: "red", marginBottom: "1rem", padding: "1rem", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
                {error}
              </div>
            )}

            <div style={{ 
              backgroundColor: "#f9f9f9", 
              padding: "2rem", 
              borderRadius: "8px", 
              marginBottom: "2rem",
              textAlign: "center"
            }}>
              <h3>Are you sure you want to delete this member?</h3>
              <p style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
                <strong>Name:</strong> {member.firstName} {member.lastName}
              </p>
              <p style={{ color: "#666", marginBottom: "2rem" }}>
                This action cannot be undone. The member will be permanently removed from your account.
              </p>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button 
                  onClick={handleDelete} 
                  disabled={loading}
                  style={{
                    padding: "0.75rem 2rem",
                    backgroundColor: loading ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "1rem"
                  }}
                >
                  {loading ? "Deleting..." : "Delete Member"}
                </button>
                
                <button 
                  onClick={handleCancel}
                  style={{
                    padding: "0.75rem 2rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMember;
