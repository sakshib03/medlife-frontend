import React, { useState, useEffect } from "react";
import "./css_files/AddMember.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useLocation, useNavigate } from "react-router-dom";

const EditMember = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = location.state || {};

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
    prescription: "Metformin, Januvia, Acebutolol, Betaxolol, Aspirin, Etizolam, Elavil",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || "John",
        lastName: member.lastName || "Smith",
        dob: member.dob || "01/01/1950",
        race: member.race || "Asian Indian",
        gender: member.gender || "Male",
        height: member.height || "5.10ft",
        weight: member.weight || "200lbs",
        a1c: member.a1c || "10.5",
        bloodPressure: member.bloodPressure || "150/90",
        bmi: member.bmi || "29",
        prescription: member.medicine || "Metformin, Januvia, Acebutolol, Betaxolol, Aspirin, Etizolam, Elavil",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const editMember = async () => {
    const email = localStorage.getItem("userEmail") || "demo@medlife.com";

    const memberData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dob: formData.dob.trim(),
      race: formData.race.trim(),
      gender: formData.gender.trim(),
      height: formData.height.replace("ft", "").trim(),
      weight: formData.weight.replace("lbs", "").trim(),
      a1c: formData.a1c.trim(),
      bloodPressure: formData.bloodPressure.trim(),
      medicine: formData.prescription.trim(),
      bmi: parseInt(formData.bmi) || 0,
      tokens: member?.tokens || 0,
      email: email,
    };

    try {
      const response = await fetch(
        `http://localhost:8000/medlife/editmember?email=${encodeURIComponent(
          email
        )}&member_index=${member?.memberIndex || 1}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server Response:", data);
        alert(data.detail || JSON.stringify(data) || "Failed to edit member");
        return;
      }

      alert("✅ Member updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert("Server error: " + error.message);
    }
  };

  const handleSubmit = () => {
    editMember();
  };

  return (
    <div className="new-member-container">
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
        <div>
          <button className="logout" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      <main className="new-member-main">
        Update the member information below and then press UPDATE at the bottom of the screen
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
            required
          />

          <label className="new-member-label">Last Name *</label>
          <input
            type="text"
            id="lastName"
            className="new-member-input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label className="new-member-label">DOB *</label>
          <input
            type="date"
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
          onClick={handleSubmit}
        >
          Update
        </button>
        <button
          className="new-member-button new-member-cancel-btn"
          onClick={() => navigate("/dashboard")}
        >
          Cancel
        </button>
      </div>

      <footer className="new-member-footer">
        © Vikram Sethi Contact : vikram@vikramsethi.com
      </footer>
    </div>
  );
};

export default EditMember;
