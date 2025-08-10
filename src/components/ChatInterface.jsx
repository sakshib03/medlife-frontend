import React, { useState, useEffect, useRef } from "react";
import "./css_files/ChatInterface.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import cloudIcon from "../assets/images/cloud.jpg";
import userIcon from "../assets/images/Depth 6, Frame 0.png";
import aiIcon from "../assets/images/Depth 5, Frame 0.png";
import settings from "../assets/images/Depth 4, Frame 1.png";
import medlife from "../assets/v987-18a-removebg-preview.png";

import { useNavigate, useLocation } from "react-router-dom";
import { Send, Download, Home } from "lucide-react";

const ChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add a special loading message id to track loading message
  const loadingMessageId = "loading-message";
  const chatMessagesRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    setEmail(storedEmail);
  }, []);

  // Helper to get API key for current user email
  const getUserApiKey = () => {
    if (!email) return null;
    return localStorage.getItem(`api_key_${email}`);
  };

  // Helper to set API key for current user email
  const setUserApiKey = (key) => {
    if (!email) return;
    localStorage.setItem(`api_key_${email}`, key);
  };
  const [isSettings, setIsSettings] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState(
    localStorage.getItem("selectedAPI") || ""
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey") || "");
  const [openaiApiKey, setOpenaiApiKey] = useState(
    localStorage.getItem("apiKey") || ""
  );
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [isApiKeyRequired, setIsApiKeyRequired] = useState(true);

  const appendMessage = (sender, name, text) => {
    const newMessage = {
      sender,
      name,
      text: text.replace(/\\n/g, "\n").replace(/\n/g, "<br>"),
      id: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || !selectedMember) return;

    // Check if API key is available
    const apiKey = getUserApiKey();
    if (!apiKey) {
      setShowApiKeyPopup(true);
      return;
    }

    appendMessage("user", "You", message);
    // Clear input immediately after sending message
    setUserInput("");
    // Add loading message to chat
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        name: "Medlife.ai",
        text: "Analyzing<span class='dot'>.</span><span class='dot'>.</span><span class='dot'>.</span>",
        id: loadingMessageId,
      },
    ]);
    setIsLoading(true);

    try {
      const email = localStorage.getItem("userEmail") || "";
      const memberData = selectedMember ? JSON.stringify(selectedMember) : "";

      const response = await fetch(
        `http://localhost:8000/medlife/ask_ai/?query=${encodeURIComponent(
          message
        )}&api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(
          email
        )}&member_data=${encodeURIComponent(memberData)}`
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response from backend:", errorData);
        if (errorData.includes("OpenAI API key")) {
          // Remove loading message
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== loadingMessageId)
          );
          appendMessage(
            "ai",
            "Medlife.ai",
            "Please provide a valid OpenAI API key to continue."
          );
          setShowApiKeyPopup(true);
        } else if (errorData.includes("quota")) {
          // Remove loading message
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== loadingMessageId)
          );
          appendMessage(
            "ai",
            "Medlife.ai",
            "Your OpenAI API key has exceeded its quota. Please check your plan and billing details."
          );
        } else {
          // Remove loading message
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== loadingMessageId)
          );
          appendMessage("ai", "Medlife.ai", `Error from backend: ${errorData}`);
          throw new Error("Failed to get AI response");
        }
      } else {
        const aiResponse = await response.text();
        // Remove loading message
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessageId)
        );
        appendMessage("ai", "Medlife.ai", aiResponse);
      }
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId));
      appendMessage(
        "ai",
        "Medlife.ai",
        "Sorry, I couldn't get a response. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChat = async () => {
    if (!email || !selectedMember) {
      alert("No member selected or user email missing.");
      return;
    }

    try {
      const url = `http://localhost:8000/medlife/saveChat/?email=${encodeURIComponent(
        email
      )}&member_name=${encodeURIComponent(
        selectedMember.firstName + "_" + selectedMember.lastName
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save chat data");
      }

      if (response.ok) {
        toast.success("Chat saved to server successfully.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error saving chat data:", error);
      toast.error("Error saving chat data. Please try again.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDownloadChat = () => {
    if (!email || !selectedMember) {
      alert("No member selected or user email missing.");
      return;
    }

    // Import getPdf dynamically
    import("./getPdf.jsx")
      .then((module) => {
        const generatePDF = module.default;

        // Format messages for PDF
        const formattedMessages = messages.map((msg) => ({
          type: msg.sender,
          name: msg.name,
          message: msg.text.replace(/<br>/g, "\n"),
        }));

        // Generate PDF with member name
        generatePDF(formattedMessages, selectedMember.fullName);
      })
      .catch((error) => {
        console.error("Error loading PDF generator:", error);
        alert("Error generating PDF. Please try again.");
      });
  };

  const handleLogout = () => {
    // Clear API key and related data on logout to force re-entry on next login
    const email = localStorage.getItem("userEmail");
    if (email) {
      localStorage.removeItem(`api_key_${email}`);
    }
    localStorage.removeItem("selectedAPI");
    localStorage.removeItem("apiKey");
    localStorage.removeItem("openai_api_key");
    localStorage.clear();
    navigate("/signin");
  };

  const handleQuestionSelect = (question) => {
    setUserInput(question);
    document.querySelector(".input-area input").focus();
  };

  const handleSubmitAPIKey = () => {
    if (!selectedAPI || !apiKey) {
      alert("Please select an API provider and enter the key");
      return;
    }

    const email = localStorage.getItem("userEmail");
    if (email) {
      localStorage.setItem(`api_key_${email}`, apiKey);
    }

    localStorage.setItem("selectedAPI", selectedAPI);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("openai_api_key", apiKey); // For backward compatibility

    // Show flash message
    const flashMessage = document.createElement("div");
    flashMessage.className = "flash-message";
    flashMessage.textContent = `${selectedAPI.toUpperCase()} API key saved successfully!`;
    flashMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `;

    document.body.appendChild(flashMessage);
    setTimeout(() => {
      flashMessage.remove();
    }, 3000);

    setIsSettings(false);
    setShowApiKeyPopup(false);
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (location.state?.member) {
      setSelectedMember(location.state.member);
      localStorage.setItem(
        "currentMember",
        JSON.stringify(location.state.member)
      );
    } else {
      const storedMember = localStorage.getItem("currentMember");
      if (storedMember) {
        setSelectedMember(JSON.parse(storedMember));
      }
    }
  }, [location]);

  useEffect(() => {
    // Check if API key for current user exists in localStorage
    const storedUserApiKey = getUserApiKey();
    console.log("Checking API key on email change:", storedUserApiKey);
    if (!storedUserApiKey) {
      setShowApiKeyPopup(true);
    } else {
      setShowApiKeyPopup(false);
    }
  }, [email]);

  return (
    <div className="chat-section-interface">
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
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
          <img
            src={settings}
            style={{ width: "40px", height: "40px", cursor: "pointer" }}
            onClick={() => setIsSettings(true)}
            alt="Settings"
          />
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="chat-container">
        <div className="sidebar">
          <div>
            <h3>Recommended Health Questions</h3>
            <ul>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Are there any drug interactions I should be aware of?"
                  )
                }
              >
                Are there any drug interactions I should be aware of?
              </li>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Is there any prescriptions I should be particularly concerned about if added to my list?"
                  )
                }
              >
                Is there any prescriptions I should be particularly concerned
                about if added to my list?
              </li>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Are there any medical symptoms I should monitor for when taking my prescriptions?"
                  )
                }
              >
                Are there any medical symptoms I should monitor for when taking
                my prescriptions?
              </li>
            </ul>
          </div>

          <div>
            <h3>Optional Questions</h3>
            <ul>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Could you display the two most influential medical articles for me?"
                  )
                }
              >
                Could you display the two most influential medical articles for
                me?
              </li>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Can you provide summaries of both articles, limited to 150 words each?"
                  )
                }
              >
                Can you provide summaries of both articles, limited to 150 words
                each?
              </li>
              <li
                onClick={() =>
                  handleQuestionSelect(
                    "Are there any clinical trials which would interest me?"
                  )
                }
              >
                Are there any clinical trials which would interest me?
              </li>
            </ul>
          </div>

          <div
            className="upgrade"
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Home size={18} />
            Dashboard
          </div>

          {/* 🎯 Highlighted member indicator */}
          <div style={{ marginTop: "6px", textAlign: "center" }}>
            {selectedMember ? (
              <div
                onClick={() => navigate("/dashboard")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#e0f7fa",
                  color: "#00796b",
                  fontWeight: "600",
                  borderRadius: "18px",
                  fontSize: "0.95rem",
                  border: "1px solid #00bfa5",
                  cursor: "pointer",
                  boxShadow: "0 0 6px rgba(0, 191, 165, 0.2)",
                  transition: "all 0.3s ease-in-out",
                }}
                title="Chatbot has this member's data"
              >
                ✅ {selectedMember.fullName}
              </div>
            ) : (
              <span style={{ color: "#999", fontStyle: "italic" }}>
                No member selected
              </span>
            )}
          </div>
        </div>

        <div className="main-content">
          <div className="chat-main">
            <div className="chat-header">
              <h1>Medlife Assist</h1>
              <p>Would like to talk about your Health?</p>
            </div>

            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-header">
                    <img
                      src={message.sender === "user" ? userIcon : aiIcon}
                      alt={message.name}
                    />
                    <strong>{message.name}:</strong>
                  </div>
                  <p dangerouslySetInnerHTML={{ __html: message.text }} />
                </div>
              ))}
            </div>

            <div className="input-area">
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                {/* Removed AI provider dropdown and API key input here as per user request */}
              </div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  localStorage.getItem("apiKey")
                    ? "Type your question here..."
                    : "Please enter your API key first..."
                }
                disabled={!localStorage.getItem("apiKey")}
              />
              {/* Removed loading indicator from input area as per user request */}
              <button
                onClick={handleSendMessage}
                disabled={!localStorage.getItem("apiKey")}
              >
                <Send size={20} />
              </button>
              <button
                onClick={handleSaveChat}
                disabled={!localStorage.getItem("apiKey")}
              >
                <img src={cloudIcon} alt="Save" />
              </button>
              <button
                onClick={handleDownloadChat}
                disabled={!localStorage.getItem("apiKey")}
              >
                <Download size={20} />
              </button>
            </div>
          </div>

          <div className="note">
            <p>
              <span>Note:</span> medlife.ai can make mistakes. Consider checking
              important information.
            </p>
          </div>
        </div>
      </div>

      {isSettings && (
        <div className="modal-overlay">
          <div className="modal-content api-key-modal">
            <button
              className="modal-close-btn"
              onClick={() => {
                setIsSettings(false);
                // Reset to current saved values on cancel
                const currentAPI = localStorage.getItem("selectedAPI") || "";
                const currentKey = localStorage.getItem("apiKey") || "";
                setSelectedAPI(currentAPI);
                setApiKey(currentKey);
              }}
            >
              ✖
            </button>

            <div>
              <p className="modal-subtitle">Current AI Provider and API Key</p>
              <div className="api-providers-list">
                <p className="modal-subtitle">Select AI Provider</p>
                {["openai", "gemini", "cloude", "mistral", "ollama"].map(
                  (provider) => {
                    const isCurrent =
                      localStorage.getItem("selectedAPI") === provider;
                    const isSelected = selectedAPI === provider;
                    return (
                      <div
                        key={provider}
                        className={`api-provider ${
                          isCurrent
                            ? "current-provider"
                            : isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => setSelectedAPI(provider)}
                        style={{
                          backgroundColor: isCurrent
                            ? "#d4edda"
                            : isSelected
                            ? "#e7f1ff"
                            : "white",
                          borderColor: isCurrent ? "#28a745" : "#007bff",
                          cursor: "pointer",
                          padding: "10px",
                          marginBottom: "8px",
                          borderRadius: "6px",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        <div className="provider-info">
                          <span className="provider-name">
                            {provider.charAt(0).toUpperCase() +
                              provider.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="api-key-input">
                <label htmlFor="apiKey">
                  {selectedAPI ? selectedAPI.toUpperCase() : "Select Provider"}{" "}
                  API Key
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
                <small>
                  Your API key will be stored securely in your browser's local
                  storage
                </small>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsSettings(false);
                  // Reset to current saved values on cancel
                  const currentAPI = localStorage.getItem("selectedAPI") || "";
                  const currentKey = localStorage.getItem("apiKey") || "";
                  setSelectedAPI(currentAPI);
                  setApiKey(currentKey);
                }}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmitAPIKey}
                disabled={!selectedAPI || !apiKey}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showApiKeyPopup && (
        <div className="modal-overlay">
          <div className="modal-content api-key-modal">
            <h2>Enter Your AI API Key</h2>
            <p
              style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}
            >
              Please select your AI provider and enter your API key
            </p>
            <select
              value={selectedAPI}
              onChange={(e) => setSelectedAPI(e.target.value)}
              style={{
                marginBottom: "10px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                width: "100%",
              }}
            >
              <option value="">Select AI Provider</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
              <option value="mistral">Mistral</option>
              <option value="ollama">Ollama</option>
            </select>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <div className="modal-buttons">
              <button
                className="submit-btn"
                onClick={() => {
                  if (!selectedAPI) {
                    alert("Please select an AI provider");
                    return;
                  }
                  if (apiKey.trim() === "") {
                    alert("API key cannot be empty");
                    return;
                  }
                  const email = localStorage.getItem("userEmail");
                  if (email) {
                    localStorage.setItem(`api_key_${email}`, apiKey.trim());
                  }
                  localStorage.setItem("selectedAPI", selectedAPI);
                  localStorage.setItem("apiKey", apiKey.trim());
                  localStorage.setItem("openai_api_key", apiKey.trim()); // For backward compatibility
                  alert(
                    `${selectedAPI.toUpperCase()} API key saved successfully!`
                  );
                  setShowApiKeyPopup(false);
                }}
              >
                Save & Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
