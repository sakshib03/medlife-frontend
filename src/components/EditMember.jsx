import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/AddMember.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API_BASE } from "../config";

const EditMember = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Smith",
    dob: "2025-08-13",
    race: "Asian Indian",
    gender: "Male",
    height: "5.10ft",
    weight: "200lbs",
    a1c: "10.5",
    bloodPressure: "150/90",
    bmi: "",
    zip_code: "43001",
    prescription:
      "Metformin, Januvia, Acebutolol, Betaxolol, Aspirin, Etizolam, Elavil",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        dob: member.dob || "",
        race: member.race || "",
        gender: member.gender || "",
        height: member.height || "",
        weight: member.weight || "",
        a1c: member.a1c || "",
        bloodPressure: member.bloodPressure || "",
        bmi: member.bmi || "",
        zip_code: member.zip_code || "",
        prescription:
          member.medicine ||
          "",
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

  const safeNumberText = (v) => {
    if (!v) return "";
    return String(v).replace(/[^\d.]/g, "");
  };

  const editMember = async () => {
    const email = Cookies.get("userEmail") || "";
    const memberIndex = member?.memberIndex || 1;

    // Build payload to match FastAPI Data model exactly
    const payload = {
      firstName: (formData.firstName || "").trim(),
      lastName: (formData.lastName || "").trim(),
      dob: (formData.dob || "").trim(),
      race: (formData.race || "").trim(),
      gender: (formData.gender || "").trim(),
      height: safeNumberText(formData.height), // "5.10" from "5.10ft"
      weight: safeNumberText(formData.weight), // "200" from "200lbs"
      a1c: (formData.a1c || "").trim(),
      bloodPressure: (formData.bloodPressure || "").trim(),
      medicine: (formData.prescription || "").trim(),
      zip_code: (formData.zip_code || "").trim(),
      bmi: safeNumberText(formData.bmi),
      email, // required by backend body schema
    };

    try {
      const response = await fetch(
        `${API_BASE}/editmember?member_index=${memberIndex}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server Response:", data);
        toast.error(
          data.detail || JSON.stringify(data) || "Failed to edit member",
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
          }
        );
        return;
      }

      toast.success("Member updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Server error: " + error.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    }
  };

  const handleSubmit = () => {
    editMember();
  };

  return (
    <div className="new-member-container">
      <ToastContainer position="top-right" autoClose={2000} />
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
        Update the member information below and then press UPDATE at the bottom
        of the screen
      </main>

      <div className="new-member-form-container">
        <div className="new-member-form-section">
          <h3 className="new-member-h3">Personal Information</h3>

          <label className="new-member-label">First Name</label>
          <input
            type="text"
            id="firstName"
            className="new-member-input"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label className="new-member-label">Last Name</label>
          <input
            type="text"
            id="lastName"
            className="new-member-input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label className="new-member-label">DOB</label>
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

          <label className="new-member-label">Zip Code</label>
          <input
            type="text"
            id="zip_code"
            className="new-member-input"
            value={formData.zip_code}
            onChange={handleChange}
          />
        </div>

        <div className="new-member-form-section">
          <h3 className="new-member-h3">Medical Information</h3>

          <label className="new-member-label">Height</label>
          <input
            type="text"
            id="height"
            className="new-member-input"
            value={formData.height}
            onChange={handleChange}
          />

          <label className="new-member-label">Weight</label>
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
        <label className="new-member-label">Prescription</label>
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
