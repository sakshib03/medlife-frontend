import React, { useState, useEffect } from "react";
import "./css_files/AddMember.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const AddMember = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialFormData = {
    firstName: "",
    lastName: "",
    dob: "",
    race: "",
    gender: "",
    height: "",
    weight: "",
    a1c: "",
    bloodPressure: "",
    bmi: "",
    zip_code: "",
    prescription: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (location.state && location.state.member) {
      setFormData((prev) => ({ ...prev, ...location.state.member }));
      setIsEditMode(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const safeNumberText = (v) => {
    if (!v) return "";
    const n = String(v).replace(/[^\d.]/g, "");
    return n;
  };

  const validateForm = () => {
    // Optional fields—the API will store what’s provided.
    return true;
  };

  const buildMemberPayload = (email) => {
    return {
      email,
      firstName: (formData.firstName || "").trim(),
      lastName: (formData.lastName || "").trim(),
      dob: (formData.dob || "").trim(),
      race: (formData.race || "").trim(),
      gender: (formData.gender || "").trim(),
      height: safeNumberText(formData.height),          // "5.10" from "5.10ft"
      weight: safeNumberText(formData.weight),          // "200" from "200lbs"
      a1c: (formData.a1c || "").trim(),
      bloodPressure: (formData.bloodPressure || "").trim(),
      medicine: (formData.prescription || "").trim(),
      bmi: safeNumberText(formData.bmi),
      zip_code: (formData.zip_code || "").trim(),
    };
  };

  const addMember = async () => {
    const email = Cookies.get("userEmail") || "";
    const memberData = buildMemberPayload(email);

    try {
      const response = await fetch("http://localhost:8000/medlifeV21/addmember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server Response:", data);
        toast.error(data.detail || "Failed to add member");
        return;
      }
      toast.success("Member added successfully!", { autoClose: 2000 });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Server error: " + error.message);
    }
  };

  const editMember = async () => {
    const email = Cookies.get("userEmail") || "";
    const memberData = buildMemberPayload(email);

    try {
      const response = await fetch(
        `http://localhost:8000/medlifeV21/editmember?email=${encodeURIComponent(
          email
        )}&member_name=${encodeURIComponent(
          (formData.firstName || "") + "," + (formData.lastName || "")
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Server Response:", data);
        toast.error(data.detail || "Failed to edit member");
        return;
      }

      toast.success("✅ Member updated successfully!", { autoClose: 2000 });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Server error: " + error.message);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please add all the fields");
      return;
    }
    if (isEditMode) {
      editMember();
    } else {
      addMember();
    }
  };

  return (
    <div className="new-member-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
        <div><h1 className="title">MedLife AI</h1></div>
        </div>
        <div>
          <button className="logout" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      <main className="new-member-main">
        Begin by filling all the fields below and then press CONFIRM
      </main>

      <div className="new-member-form-container">
        <div className="new-member-form-section">
          <h3 className="new-member-h3">Personal Information</h3>

          <label className="new-member-label">First Name</label>
          <input
            type="text"
            id="firstName"
            className="new-member-input"
            placeholder={formData.firstName || "John"}
            value={formData.firstName}
            onChange={handleChange}
          />

          <label className="new-member-label">Last Name</label>
          <input
            type="text"
            id="lastName"
            className="new-member-input"
            placeholder={formData.lastName || "Smith"}
            value={formData.lastName}
            onChange={handleChange}
          />

          <label className="new-member-label">DOB</label>
          <input
            type="date"
            id="dob"
            className="new-member-input"
            placeholder={formData.dob || "2025-08-13"}
            value={formData.dob}
            onChange={handleChange}
          />

          <label className="new-member-label">Race</label>
          <input
            type="text"
            id="race"
            className="new-member-input"
            placeholder={formData.race || "Asian Indian"}
            value={formData.race}
            onChange={handleChange}
          />

          <label className="new-member-label">Gender</label>
          <input
            type="text"
            id="gender"
            className="new-member-input"
            placeholder={formData.gender || "Male"}
            value={formData.gender}
            onChange={handleChange}
          />

          <label className="new-member-label">Zip Code</label>
          <input
            type="text"
            id="zip_code"
            className="new-member-input"
            placeholder={formData.zip_code || "43001"}
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
            placeholder={formData.height || "5.10ft"}
            value={formData.height}
            onChange={handleChange}
          />

          <label className="new-member-label">Weight</label>
          <input
            type="text"
            id="weight"
            className="new-member-input"
            placeholder={formData.weight || "200lbs"}
            value={formData.weight}
            onChange={handleChange}
          />

          <label className="new-member-label">A1C</label>
          <input
            type="text"
            id="a1c"
            className="new-member-input"
            placeholder={formData.a1c || "10.5"}
            value={formData.a1c}
            onChange={handleChange}
          />

          <label className="new-member-label">Blood Pressure</label>
          <input
            type="text"
            id="bloodPressure"
            className="new-member-input"
            placeholder={formData.bloodPressure || "150/90"}
            value={formData.bloodPressure}
            onChange={handleChange}
          />

          <label className="new-member-label">BMI</label>
          <input
            type="text"
            id="bmi"
            className="new-member-input"
            placeholder={formData.bmi || "29"}
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
          placeholder={
            formData.prescription ||
            "Metformin, Januvia, Acebutolol, Betaxolol, Aspirin, Etizolam, Elavil"
          }
          value={formData.prescription}
          onChange={handleChange}
        />
      </div>

      <div className="new-member-button-container">
        <button
          className="new-member-button new-member-add-btn"
          onClick={handleSubmit}
        >
          {isEditMode ? "Update Member" : "Add Member"}
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

export default AddMember;
