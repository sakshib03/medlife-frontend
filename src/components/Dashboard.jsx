import React, { useState } from "react";
import "./css_files/Dashboard.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Edit, Download } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [data, setData] = useState([
    { name: "Jon roy", value: 100 },
    { name: "John Smith", value: 120 },
  ]);

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

  const addMember = () => {
    if (data.length >= 4) {
      alert("You've reached the maximum number of members (4)");
      return;
    }

    // Add the new member to the table
    setData((prevData) => [
      ...prevData,
      {
        name: `${formData.firstName} ${formData.lastName}`,
        value: 0,
      },
    ]);

    alert("Member added successfully!");
    setIsAddMemberModalOpen(false);

    // Reset form data
    setFormData({
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
  };

  return (
    <div className="dashboard">
      {/* Header section remains the same */}
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
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="dashboard-container">
        <div className="main-sidecontainer">
          <div className="table-container">
            <h1 className="dashboard-title">DASHBOARD</h1>
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tokens</th>
                  <th>Start Chat</th>
                  <th>Edit</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>
                      <button
                        className="start-btn"
                        onClick={() => {
                          navigate("/chat");
                        }}
                      >
                        Start
                      </button>
                    </td>
                    <td>
                      <span className="edit-icon">
                        <Edit size={18} />
                      </span>
                    </td>
                    <td>
                      <span className="pdf-icon">
                        <Download size={20} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="add-member-btn"
            onClick={() => {
              if (data.length >= 4) {
                alert("You've reached the maximum number of members (4)");
              } else {
                setIsAddMemberModalOpen(true);
              }
            }}
          >
            + Add New Member
          </button>

          <p className="member-limit">You can add only up to four members.</p>

          <div className="note-section">
            <h3>Note:</h3>
            <p>
              To save the chat to the cloud, click on the Cloud icon in the chat
              box next to the send button. For reference, download a PDF of your
              chat history by clicking the Download icon next to the Cloud
              Button in the chat box.
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              ✖
            </button>

            <div className="new-member-container">
              <main className="new-member-main">
                Begin by editing the sample patient information below and then
                press CONFIRM at the bottom of the screen
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
                  onClick={addMember}
                >
                  Add Member
                </button>
                <button
                  className="new-member-button new-member-cancel-btn"
                  onClick={() => setIsAddMemberModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
