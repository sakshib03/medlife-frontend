import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/Dashboard.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Edit, Download, User } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Fetch members on component mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);

    if (email) {
      fetch(
        `http://localhost:8000/api/get-username?email=${encodeURIComponent(
          email
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUserName(data.username);
          } else {
            setUserName("User");
          }
        })
        .catch(() => {
          setUserName("User");
        });
    } else {
      setUserName("User");
    }

    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/medlife/getmember?email=${encodeURIComponent(
          email
        )}`
      );
      const result = await response.json();

      if (response.ok) {
        const members = result.members
          .map((member, index) => ({
            name: `${member.firstName} ${member.lastName}`,
            value: member.tokens || 0,
            memberIndex: index + 1, // Add member slot index 1-4
            ...member,
          }))
          .filter((member) => member.firstName); // Filter out empty members
        setData(members);
      } else {
        console.error("Failed to fetch members:", result.detail);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    navigate("/medlife/addmember");
  };

  const handleStartChat = async (member) => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      toast.error("User not logged in", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/member-details/${encodeURIComponent(
          email
        )}/${member.memberIndex}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch member details");
      }
      const data = await response.json();
      localStorage.setItem("currentMember", JSON.stringify(data.member));
      navigate("/medlife/prompt", {
        state: { member: data.member, memberName: member.name },
      });
    } catch (error) {
      toast.error("Failed to load member details. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const handleEditMember = (member) => {
    navigate("/medlife/editmember", { state: { member: member } });
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowModal(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    const email = localStorage.getItem("userEmail");
    if (!email) {
      toast.error("User not logged in", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/medlife/deletemember?email=${encodeURIComponent(
          email
        )}&member_index=${memberToDelete.memberIndex}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(
          typeof data === "object"
            ? JSON.stringify(data)
            : data || "Failed to delete member",
          { autoClose: 2000 }
        );
        return;
      }
      toast.success("Member deleted successfully", { autoClose: 2000 });
      fetchMembers(); // Refresh the list
    } catch (error) {
      toast.error("Server error: " + error.message, { autoClose: 2000 });
    } finally {
      setShowModal(false);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="dashboard">
      {/* Polished header with user badge styles from Dashboard.css */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="dash-header">
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <h1 className="title">MedLife AI</h1>
        </div>

        <div className="header-right">
          <UserBadge
            name={userName || "User"}
            email={userEmail || "No email"}
          />
          <button className="logout" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="main-sidecontainer">
          <div className="table-container">
            <h1 className="dashboard-title">DASHBOARD</h1>
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Chat</th>
                  <th>Edit</th>
                  <th>PDF</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {data.filter((item) => item.firstName).length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#999",
                      }}
                    >
                      No members yet. Click "+ Add New Member" to begin.
                    </td>
                  </tr>
                ) : (
                  data
                    .filter((item) => item.firstName)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          <button
                            className="start-btn"
                            onClick={() => handleStartChat(item)}
                          >
                            Start
                          </button>
                        </td>
                        <td>
                          <span
                            className="edit-icon"
                            onClick={() => handleEditMember(item)}
                            style={{ cursor: "pointer" }}
                          >
                            <Edit size={18} />
                          </span>
                        </td>
                        <td>
                          <span
                            className="pdf-icon"
                            onClick={async () => {
                              const email = localStorage.getItem("userEmail");
                              if (!email) {
                                toast.error("User not logged in", {
                                  autoClose: 2000,
                                });
                                return;
                              }

                              try {
                                // Fetch chat data from backend
                                const response = await fetch(
                                  `http://localhost:8000/medlife/fetchChat/?email=${encodeURIComponent(
                                    email
                                  )}&member_name=${encodeURIComponent(
                                    item.firstName + "_" + item.lastName
                                  )}`
                                );
                                if (!response.ok) {
                                  throw new Error("Failed to fetch chat data");
                                }
                                const data = await response.json();
                                const messages = data.chat || [];

                                if (messages.length === 0) {
                                  toast.info(
                                    "Start chat first before downloading PDF",
                                    {
                                      position: "top-right",
                                      autoClose: 2000,
                                      hideProgressBar: false,
                                      closeOnClick: true,
                                      draggable: true,
                                      progress: undefined,
                                    }
                                  );
                                  return;
                                }

                                // Import and use getPdf
                                const { default: generatePDF } = await import(
                                  "./getPdf.jsx"
                                );

                                // Format messages for PDF
                                const formattedMessages = messages.map(
                                  (msg) => ({
                                    type: msg.sender,
                                    name: msg.name,
                                    message: msg.text.replace(/<br>/g, "\n"),
                                  })
                                );

                                // Generate PDF
                                generatePDF(formattedMessages, item.name);
                                toast.success("PDF generated successfully!", {
                                  position: "top-right",
                                  autoClose: 2000,
                                  hideProgressBar: false,
                                  closeOnClick: true,
                                  draggable: true,
                                  progress: undefined,
                                });
                              } catch (error) {
                                console.error("Error generating PDF:", error);
                                toast.error(
                                  "Error generating PDF. Please try again.",
                                  {
                                    position: "top-right",
                                    autoClose: 2000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    draggable: true,
                                    progress: undefined,
                                  }
                                );
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <Download size={20} />
                          </span>
                        </td>
                        <td>
                          <button
                            className="start-btn"
                            style={{ backgroundColor: "red" }}
                            onClick={() => confirmDelete(item)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <button className="add-member-btn" onClick={handleAddMember}>
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
      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            paddingBottom:"430px",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "8px",
              width: "350px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{fontSize:"18px", color:"black", marginBottom:"10px"}}>Confirm Delete</h3>
            <p style={{color:"gray", fontSize:"15px"}}>
              Are you sure you want to delete {memberToDelete?.name} record?
            </p>
            <div
              style={{
                marginTop: "15px",
                marginLeft:"40px",
                display: "flex",
                gap:"20px"
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#fe786b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize:"14px"
                }}
                onClick={handleDeleteMember}
              >
                Yes, Delete
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize:"14px",
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Small presentational component for the header pill */
const UserBadge = ({ name, email }) => {
  return (
    <div className="user-badge" title={`${name} (${email})`}>
      <User size={18} className="user-icon" />
      <div className="user-text">
        <span className="user-name">{name}</span>
        <span className="user-email">({email})</span>
      </div>
    </div>
  );
};

export default Dashboard;
