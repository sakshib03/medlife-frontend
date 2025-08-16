import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/Dashboard.css";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Edit, Download, User, Trash } from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "../config.js";

const Dashboard = () => {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const email = Cookies.get("userEmail");
    setUserEmail(email || "");

    if (email) {
      fetch(
        `${API_BASE}/get-username?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((res) => setUserName(res.username || "User"))
        .catch(() => setUserName("User"));
    } else {
      setUserName("User");
    }

    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    const email = Cookies.get("userEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/getmember?email=${encodeURIComponent(
          email
        )}`
      );
      const result = await response.json();

      if (response.ok) {
        const members = (result.members || [])
          .map((member, index) => ({
            name: `${member.firstName} ${member.lastName}`.trim(),
            value: member.tokens || 0,
            memberIndex:
              typeof member.memberIndex === "number"
                ? member.memberIndex
                : index + 1,
            ...member,
          }))
          .filter((m) => m.firstName);
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
    if (data.length >= 4) {
      toast.error("Maximum of 4 members allowed per user", { autoClose: 2000 });
      return;
    }
    navigate("/medlife/addmember");
  };

  const handleStartChat = async (member) => {
    const email = Cookies.get("userEmail");
    if (!email) {
      toast.error("User not logged in", { autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/member-details/${encodeURIComponent(
          email
        )}/${member.memberIndex}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch member details");
      }
      const resp = await response.json();
      localStorage.setItem("currentMember", JSON.stringify(resp.member));
      navigate("/medlife/prompt", {
        state: { member: resp.member, memberName: member.name },
      });
    } catch (error) {
      toast.error("Failed to load member details. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const handleEditMember = (member) => {
    navigate("/medlife/editmember", { state: { member } });
  };

  const confirmDelete = (member) => {
    setMemberToDelete(member);
    setShowModal(true);
  };

  const handleDeleteMember = async () => {
    if (deleting || !memberToDelete) return;

    const email = Cookies.get("userEmail");
    if (!email) {
      toast.error("User not logged in", { autoClose: 2000 });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE}/deletemember?email=${encodeURIComponent(
          email
        )}&member_index=${memberToDelete.memberIndex}`,
        { method: "DELETE" }
      );

      const respJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          (respJson && (respJson.detail || respJson.message)) ||
          "Failed to delete member";
        toast.error(msg, { autoClose: 2000 });
        return;
      }

      toast.success("Member deleted successfully", { autoClose: 2000 });
      setShowModal(false);
      setMemberToDelete(null);

      // Refresh to sync indices after backend shift
      await fetchMembers();
    } catch (error) {
      toast.error("Server error: " + error.message, { autoClose: 2000 });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard">
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
          <UserBadge name={userName || "User"} email={userEmail || "No email"} />
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
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                      Loading…
                    </td>
                  </tr>
                ) : data.filter((item) => item.firstName).length === 0 ? (
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
                      <tr key={`${item.firstName}-${item.lastName}-${index}`}>
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
                            title="Edit member"
                          >
                            <Edit size={18} />
                          </span>
                        </td>
                        <td>
                          <span
                            className="pdf-icon"
                            onClick={async () => {
                              const email = Cookies.get("userEmail");
                              if (!email) {
                                toast.error("User not logged in", {
                                  autoClose: 2000,
                                });
                                return;
                              }

                              try {
                                const response = await fetch(
                                  `${API_BASE}/fetchChat/?email=${encodeURIComponent(
                                    email
                                  )}&member_name=${encodeURIComponent(
                                    item.firstName + "_" + item.lastName
                                  )}`
                                );
                                if (!response.ok) {
                                  throw new Error("Failed to fetch chat data");
                                }
                                const resp = await response.json();
                                const messages = resp.chat || [];

                                if (messages.length === 0) {
                                  toast.info(
                                    "Start chat first before downloading PDF",
                                    { autoClose: 2000 }
                                  );
                                  return;
                                }

                                const { default: generatePDF } = await import(
                                  "./getPdf.jsx"
                                );

                                const formattedMessages = messages.map((msg) => ({
                                  type: msg.sender,
                                  name: msg.name,
                                  message: String(msg.text || "").replace(
                                    /<br>/g,
                                    "\n"
                                  ),
                                }));

                                generatePDF(formattedMessages, item.name);
                                toast.success("PDF generated successfully!", {
                                  autoClose: 2000,
                                });
                              } catch (error) {
                                console.error("Error generating PDF:", error);
                                toast.error(
                                  "Error generating PDF. Please try again.",
                                  { autoClose: 2000 }
                                );
                              }
                            }}
                            style={{ cursor: "pointer" }}
                            title="Download chat as PDF"
                          >
                            <Download size={20} />
                          </span>
                        </td>
                        <td>
                          <span
                            className="edit-icon"
                            onClick={() => confirmDelete(item)}
                            style={{ cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.5 : 1 }}
                            title="Delete member"
                          >
                            <Trash size={18} />
                          </span>
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
              To download a PDF of your chat history, click on the Download icon next to the send button in the chat box. You can also change the AI Engine from the dropdown menu at the top right.
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
            paddingBottom: "430px",
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
            <h3 style={{ fontSize: "18px", color: "black", marginBottom: "10px" }}>
              Confirm Delete
            </h3>
            <p style={{ color: "gray", fontSize: "15px" }}>
              Are you sure you want to delete {memberToDelete?.name} record?
            </p>
            <div
              style={{
                marginTop: "15px",
                marginLeft: "40px",
                display: "flex",
                gap: "20px",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: deleting ? "#f5a39b" : "#fe786b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
                onClick={handleDeleteMember}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={() => {
                  if (!deleting) setShowModal(false);
                }}
                disabled={deleting}
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
        <span className="user-email">{email}</span>
      </div>
    </div>
  );
};

export default Dashboard;
