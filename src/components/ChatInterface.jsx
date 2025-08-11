import React, { useState, useEffect, useRef, useMemo } from "react";
import "./css_files/ChatInterface.css";

import cloudIcon from "../assets/images/cloud.jpg";
import userIcon from "../assets/images/Depth 6, Frame 0.png";
import aiIcon from "../assets/images/Depth 5, Frame 0.png";
import settings from "../assets/images/Depth 4, Frame 1.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate, useLocation } from "react-router-dom";
import { Send, Download, Home } from "lucide-react";

const PROVIDERS = ["openai", "gemini", "claude", "mistral"];
const properName = (p) => p.charAt(0).toUpperCase() + p.slice(1);

const ChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== User context =====
  const [email] = useState(localStorage.getItem("userEmail") || ""); // stable per session
  const keyFor = (k) => `${k}_${email}`; // per-user key helper

  // ===== Chat state =====
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // ===== UI state =====
  const [isSettings, setIsSettings] = useState(false);
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [popupClosedWithoutKey, setPopupClosedWithoutKey] = useState(false);
  const loadingMessageId = "loading-message";

  // ===== Keys per provider (per user) =====
  const initialKeys = useMemo(() => {
    const obj = {};
    PROVIDERS.forEach((p) => {
      obj[p] = localStorage.getItem(keyFor(`api_key_${p}`)) || "";
    });
    return obj;
  }, []); // email is captured above; this runs once per mount
  const [apiKeys, setApiKeys] = useState(initialKeys);

  // Providers available based on stored keys
  const availableProviders = useMemo(
    () => PROVIDERS.filter((p) => (apiKeys[p] || "").trim() !== ""),
    [apiKeys]
  );

  // Restore previously selected provider (per user) if still valid
  const initialSelected = useMemo(() => {
    const stored = localStorage.getItem(keyFor("selectedAPI")) || "";
    if (
      stored &&
      (localStorage.getItem(keyFor(`api_key_${stored}`)) || "").trim() !== ""
    ) {
      return stored;
    }
    const first = PROVIDERS.find(
      (p) => (localStorage.getItem(keyFor(`api_key_${p}`)) || "").trim() !== ""
    );
    return first || "";
  }, []); // per mount
  const [selectedAPI, setSelectedAPI] = useState(initialSelected);

  // ===== Effects =====
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (location.state?.member) {
      setSelectedMember(location.state.member);
      localStorage.setItem(
        keyFor("currentMember"),
        JSON.stringify(location.state.member)
      );
    } else {
      const storedMember = localStorage.getItem(keyFor("currentMember"));
      if (storedMember) setSelectedMember(JSON.parse(storedMember));
    }
  }, [location]); // eslint wants location

  // Show the API-key popup only once for a new user (until they save at least one key).
  useEffect(() => {
    const hasShown =
      localStorage.getItem(keyFor("hasShownApiKeyPopup")) === "true";
    const anyKey = PROVIDERS.some(
      (p) => (localStorage.getItem(keyFor(`api_key_${p}`)) || "").trim() !== ""
    );
    if (!anyKey && !hasShown) {
      setShowApiKeyPopup(true);
    } else {
      setShowApiKeyPopup(false);
    }
  }, []); // run once on mount

  // Keep per-user selected provider persisted and valid
  useEffect(() => {
    const valid = selectedAPI && (apiKeys[selectedAPI] || "").trim() !== "";
    if (valid) {
      localStorage.setItem(keyFor("selectedAPI"), selectedAPI);
    } else if (availableProviders.length) {
      const first = availableProviders[0];
      setSelectedAPI(first);
      localStorage.setItem(keyFor("selectedAPI"), first);
    } else {
      setSelectedAPI("");
      localStorage.removeItem(keyFor("selectedAPI"));
    }
  }, [selectedAPI, apiKeys, availableProviders]); // keep in sync

  // ===== Helpers =====
  const appendMessage = (sender, name, text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        name,
        text: text.replace(/\\n/g, "\n").replace(/\n/g, "<br>"),
        id: Date.now(),
      },
    ]);
  };

  // ===== Actions =====
  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || !selectedMember) return;

    if (!selectedAPI || !(apiKeys[selectedAPI] || "").trim()) {
      if (popupClosedWithoutKey) {
        toast.warn("Please enter an API key in settings, then choose a provider.", { autoClose: 2000 });
      }
      setShowApiKeyPopup(true);
      return;
    }

    appendMessage("user", "You", message);
    setUserInput("");
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        name: "Medlife.ai",
        text: "Analyzing<span class='dot'>.</span><span class='dot'>.</span><span class='dot'>.</span>",
        id: loadingMessageId,
      },
    ]);

    try {
      const memberData = selectedMember ? JSON.stringify(selectedMember) : "";
      const res = await fetch(
        `http://localhost:8000/medlife/ask_ai/?query=${encodeURIComponent(
          message
        )}&api_key=${encodeURIComponent(
          apiKeys[selectedAPI]
        )}&provider=${encodeURIComponent(
          selectedAPI
        )}&email=${encodeURIComponent(email)}&member_data=${encodeURIComponent(
          memberData
        )}`
      );

      if (!res.ok) {
        const errorData = await res.text();
        setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));

        if (errorData.toLowerCase().includes("api key")) {
          appendMessage(
            "ai",
            "Medlife.ai",
            "Please provide a valid API key to continue."
          );
          setShowApiKeyPopup(true);
        } else if (errorData.toLowerCase().includes("quota")) {
          appendMessage(
            "ai",
            "Medlife.ai",
            "Your API key has exceeded its quota."
          );
        } else {
          appendMessage("ai", "Medlife.ai", `Error from backend: ${errorData}`);
        }
        return;
      }

      const aiResponse = await res.text();
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));
      appendMessage("ai", "Medlife.ai", aiResponse);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));
      appendMessage(
        "ai",
        "Medlife.ai",
        "Sorry, I couldn't get a response. Please try again."
      );
    }
  };

  const handleSaveChat = async () => {
    if (!email || !selectedMember) {
      toast.warn("No member selected or user email missing.",{ autoClose: 2000 });
      return;
    }
    try {
      const url = `http://localhost:8000/medlife/saveChat/?email=${encodeURIComponent(
        email
      )}&member_name=${encodeURIComponent(
        `${selectedMember.firstName}_${selectedMember.lastName}`
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: messages }),
      });
      if (!response.ok) throw new Error("Failed to save chat data");

      toast.success("Chat saved to server successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.error("Error saving chat:", err);
      toast.error("Error saving chat data. Please try again.", { autoClose: 2000 });
    }
  };

  const handleDownloadChat = () => {
    if (!email || !selectedMember) {
      toast.warn("No member selected or user email missing.", { autoClose: 2000 });
      return;
    }
    import("./getPdf.jsx")
      .then((m) => {
        const generatePDF = m.default;
        const formatted = messages.map((msg) => ({
          type: msg.sender,
          name: msg.name,
          message: msg.text.replace(/<br>/g, "\n"),
        }));
        generatePDF(formatted, selectedMember.fullName);
      })
      .catch((err) => {
        console.error("Error loading PDF generator:", err);
        toast.error("Error generating PDF. Please try again.", { autoClose: 2000 });
      });
  };

  // Keep keys + “shown” flag across sign-ins; only clear transient items.
  const handleLogout = () => {
    // DO NOT remove per-user API keys or hasShown flag.
    localStorage.removeItem(keyFor("selectedAPI"));
    localStorage.removeItem(keyFor("currentMember"));
    // (Optionally remove any auth/session tokens your app uses here.)
    navigate("/signin");
  };

  const handleQuestionSelect = (q) => {
    setUserInput(q);
    const el = document.querySelector(".input-area input");
    if (el) el.focus();
  };

  // Save keys from settings & first-time popup; set “hasShown” flag true.
  const saveKeys = () => {
    const newKeys = { ...apiKeys };
    PROVIDERS.forEach((p) => {
      localStorage.setItem(keyFor(`api_key_${p}`), newKeys[p] || "");
    });

    // Mark that this user has completed the popup.
    localStorage.setItem(keyFor("hasShownApiKeyPopup"), "true");

    // Ensure a valid selected provider is set.
    const valid = selectedAPI && (newKeys[selectedAPI] || "").trim() !== "";
    if (!valid) {
      const first = PROVIDERS.find((p) => (newKeys[p] || "").trim() !== "");
      if (first) {
        setSelectedAPI(first);
        localStorage.setItem(keyFor("selectedAPI"), first);
      } else {
        setSelectedAPI("");
        localStorage.removeItem(keyFor("selectedAPI"));
      }
    } else {
      localStorage.setItem(keyFor("selectedAPI"), selectedAPI);
    }

    const flash = document.createElement("div");
    flash.textContent = "API keys saved successfully!";
    flash.style.cssText =
      "position:fixed;top:20px;right:20px;background:#4CAF50;color:#fff;padding:12px 16px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:1000;";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 2500);

    setIsSettings(false);
    setShowApiKeyPopup(false);
  };

  // ===== Render =====
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
                  color: "#fe8f85",
                  fontWeight: "600",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  border: "1px solid #fe8f85",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                }}
                title="Chatbot has this member's data"
              >
                {selectedMember.fullName}
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
            <div
              className="chat-header"
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1>Medlife Assist</h1>
                <p>Would like to talk about your Health?</p>
              </div>

              <div style={{ alignSelf: "flex-end", minWidth: 260 }}>
                <h2
                  style={{
                    marginBottom: 8,
                    textAlign: "left",
                    color: "#fe786b",
                    fontSize: 16,
                  }}
                >
                  Please select your AI provider
                </h2>
                <select
                  value={selectedAPI}
                  onChange={(e) => setSelectedAPI(e.target.value)}
                  style={{
                    marginBottom: 2,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    width: "100%",
                  }}
                >
                  {!availableProviders.length && (
                    <option value="">No providers available</option>
                  )}
                  {availableProviders.length > 0 && (
                    <option value="">Select AI Provider</option>
                  )}
                  {availableProviders.map((p) => (
                    <option
                      key={p}
                      value={p}
                      style={{ backgroundColor: "#fe8f85;" }}
                    >
                      {properName(p)}
                    </option>
                  ))}
                </select>
                <small style={{ color: "#666" }}>
                  Only providers with saved keys are listed here.
                </small>
              </div>
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
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  selectedAPI && (apiKeys[selectedAPI] || "").trim()
                    ? "Type your question here..."
                    : "Add API keys in settings, then choose a provider to start chat..."
                }
                disabled={!selectedAPI || !(apiKeys[selectedAPI] || "").trim()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!selectedAPI || !(apiKeys[selectedAPI] || "").trim()}
              >
                <Send size={20} />
              </button>
              <button onClick={handleSaveChat}>
                <img src={cloudIcon} alt="Save" />
              </button>
              <button onClick={handleDownloadChat}>
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

      {/* Settings modal: enter & save keys only */}
      {isSettings && (
        <div className="modal-overlay">
          <div className="modal-content api-key-modal">
            <button
              className="modal-close-btn"
              onClick={() => {
                setIsSettings(false);
                setPopupClosedWithoutKey(true);
              }}
            >
              ✖
            </button>

            <h2
              style={{
                marginTop: "0",
                marginBottom: "14px",
                fontSize: "20px",
                color: "#fe786b",
              }}
            >
              Current AI Providers and API Keys
            </h2>
            <div className="api-providers-list">
              {PROVIDERS.map((provider) => {
                const hasKey = (apiKeys[provider] || "").trim() !== "";
                return (
                  <div
                    key={provider}
                    className="api-provider"
                    style={{
                      marginBottom: 14,
                      border: hasKey ? "2px solid #4CAF50" : "1px solid #ccc",
                      borderRadius: 6,
                      padding: "8px",
                      position: "relative",
                    }}
                  >
                    <label
                      htmlFor={`apiKey-${provider}`}
                      style={{
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {properName(provider)} Key
                    </label>
                    <input
                      type="text"
                      id={`apiKey-${provider}`}
                      value={apiKeys[provider]}
                      onChange={(e) =>
                        setApiKeys({ ...apiKeys, [provider]: e.target.value })
                      }
                      placeholder={`Enter your ${properName(provider)} API key`}
                      style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: 6,
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                      }}
                      readOnly={false}
                    />
                    {hasKey && (
                      <svg
                        onClick={() => {
                          // Just focus input on pencil click, do not clear value
                          const input = document.getElementById(
                            `apiKey-${provider}`
                          );
                          if (input) input.focus();
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="edit-icon"
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 20,
                          height: 20,
                          cursor: "pointer",
                          color: "#4CAF50",
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.651 1.651m-2.512-2.512a2.121 2.121 0 113 3L7.5 19.5H4.5v-3L16.862 4.487z"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setIsSettings(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={saveKeys}
                disabled={PROVIDERS.every(
                  (p) => (apiKeys[p] || "").trim() === ""
                )}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-time key prompt (only once per user) */}
      {showApiKeyPopup && (
        <div className="modal-overlay">
          <div className="modal-content api-key-modal">
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowApiKeyPopup(false);
                setPopupClosedWithoutKey(true);
              }}
            >
              ✖
            </button>

            <h2>Enter Your AI API Keys</h2>
            <p style={{ marginBottom: 12, fontSize: 14, color: "#666" }}>
              Add keys for any providers you want to use. The provider dropdown
              will show only those with a saved key.
            </p>

            <div className="api-providers-list">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider}
                  className="api-provider"
                  style={{ marginBottom: 12 }}
                >
                  <label
                    htmlFor={`first-apiKey-${provider}`}
                    style={{
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {properName(provider)} Key
                  </label>
                  <input
                    type="password"
                    id={`first-apiKey-${provider}`}
                    value={apiKeys[provider]}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, [provider]: e.target.value })
                    }
                    placeholder={`Enter your ${properName(provider)} API key`}
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button
                className="submit-btn"
                onClick={saveKeys}
                disabled={PROVIDERS.every(
                  (p) => (apiKeys[p] || "").trim() === ""
                )}
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
