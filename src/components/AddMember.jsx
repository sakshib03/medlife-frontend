import React, { useState } from "react";
import "./css_files/AddMember.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Smith",
    dob: "01/01/1950",
    race: "Asian Indian",
    gender: "Male",
    height: "5.10ft",
    weight: "200lbs",
    a1c: "10.5",
    bloodPressure: "150/90",
    bmi: "29",
    prescription:
      "Metformin, Januvia, Acebutolol, Betaxolol, Aspirin, Etizolam, Elavil",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const addMember = async () => {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      alert("User email is missing. Please log in again.");
      return;
    }

    const memberData = {
      email: email,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dob: formData.dob.trim(),
      race: formData.race.trim(),
      gender: formData.gender.trim(),
      height: formData.height ? formData.height.replace("ft", "") : null,
      weight: formData.weight ? formData.weight.replace("lbs", "") : null,
      a1c: formData.a1c.trim(),
      bloodPressure: formData.bloodPressure.trim(),
      medicine: formData.prescription.trim(),
      bmi: formData.bmi ? parseInt(formData.bmi) : null,
      tokens: 0,
    };

    console.log("🚀 Sending data:", JSON.stringify(memberData, null, 2));

    try {
      const response = await fetch("http://127.0.0.1:8001/medlife/addmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server Response:", data);
        throw new Error(data.detail || "Failed to add member");
      }

      alert("✅ Member added successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "/signin";
  };

  return (
    <div>
      <div className="new-member-container">
        <header>
          <div className="header-left">
            <img src={medlife} alt="MedLife AI Logo" className="logo" />
            <div>
              <h1 className="title">MedLife AI</h1>
            </div>
          </div>
          <div>
            <button
              className="logout"
              onClick={() => {
                navigate("/");
              }}
            >
              Logout{" "}
            </button>
          </div>
        </header>

        <main className="new-member-main">
          Begin by editing the sample patient information below and then press
          CONFIRM at the bottom of the screen
        </main>

        <div className="new-member-form-container">
          <div className="new-member-form-section">
            <h3 className="new-member-h3">Personal Information</h3>
            <label className="new-member-label">First Name *</label>
            <input
              type="text"
              id="firstName"
              className="new-member-input"
              value={formData.firstName}
              onChange={handleChange}
            />

            <label className="new-member-label">Last Name *</label>
            <input
              type="text"
              id="lastName"
              className="new-member-input"
              value={formData.lastName}
              onChange={handleChange}
            />

            <label className="new-member-label">DOB *</label>
            <input
              type="text"
              id="dob"
              className="new-member-input"
              value={formData.dob}
              onChange={handleChange}
            />

            <label className="new-member-label">Race</label>
            <input
              type="text"
              id="race"
              className="new-member-input"
              value={formData.race}
              onChange={handleChange}
            />

            <label className="new-member-label">Gender</label>
            <input
              type="text"
              id="gender"
              className="new-member-input"
              value={formData.gender}
              onChange={handleChange}
            />
          </div>

          <div className="new-member-form-section">
            <h3 className="new-member-h3">Medical Information</h3>
            <label className="new-member-label">Height *</label>
            <input
              type="text"
              id="height"
              className="new-member-input"
              value={formData.height}
              onChange={handleChange}
            />

            <label className="new-member-label">Weight *</label>
            <input
              type="text"
              id="weight"
              className="new-member-input"
              value={formData.weight}
              onChange={handleChange}
            />

            <label className="new-member-label">A1C</label>
            <input
              type="text"
              id="a1c"
              className="new-member-input"
              value={formData.a1c}
              onChange={handleChange}
            />

            <label className="new-member-label">Blood Pressure</label>
            <input
              type="text"
              id="bloodPressure"
              className="new-member-input"
              value={formData.bloodPressure}
              onChange={handleChange}
            />

            <label className="new-member-label">BMI</label>
            <input
              type="text"
              id="bmi"
              className="new-member-input"
              value={formData.bmi}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="new-member-prescription-container">
          <label className="new-member-label">Prescription *</label>
          <textarea
            id="prescription"
            className="new-member-textarea"
            value={formData.prescription}
            onChange={handleChange}
          />
        </div>

        <div className="new-member-button-container">
          <button
            className="new-member-button new-member-add-btn"
            onClick={addMember}
          >
            Add Member
          </button>
          <button
            className="new-member-button new-member-cancel-btn"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      <footer className="new-member-footer">
        © Vikram Sethi Contact : vikram@vikramsethi.com
      </footer>
    </div>
  );
};

export default AddMember;
