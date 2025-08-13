import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import "./css_files/ChatInterface.css";

import cloudIcon from "../assets/images/cloud.jpg";
import userIcon from "../assets/images/Depth 6, Frame 0.png";
import aiIcon from "../assets/images/Depth 5, Frame 0.png";
import settings from "../assets/images/Depth 4, Frame 1.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  Download,
  Home,
  Edit,
  Trash2,
  ChevronDown,
  Pencil,
  Check,
  X,
  Plus,
} from "lucide-react";

const PROVIDERS = ["openai", "gemini", "claude", "mistral"];
const properName = (p) => p.charAt(0).toUpperCase() + p.slice(1);
const API_BASE = "https://semantic.onesmarter.com/medlifeV2/";

// Prefer stable ids from server; fallback to UUID / timestamp
const makeId = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ChatInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== User context =====
  const [email] = useState(Cookies.get("userEmail"));
  const keyFor = (k) => `${k}_${email}`;

  // ===== Chat state =====
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Load all chat history for all members

  // ===== Chat history =====
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isRenamingChatId, setIsRenamingChatId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const chatsListRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const [data, setData] = useState([]);

  // ===== UI =====
  const [isSettings, setIsSettings] = useState(false);
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [popupClosedWithoutKey, setPopupClosedWithoutKey] = useState(false);
  const loadingMessageId = "loading-message";

  // ===== Provider keys =====
  const initialKeys = useMemo(() => {
    const obj = {};
    PROVIDERS.forEach((p) => {
      obj[p] = localStorage.getItem(keyFor(`api_key_${p}`)) || "";
    });
    return obj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [apiKeys, setApiKeys] = useState(initialKeys);

  const availableProviders = useMemo(
    () => PROVIDERS.filter((p) => (apiKeys[p] || "").trim() !== ""),
    [apiKeys]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedAPI, setSelectedAPI] = useState(initialSelected);

  // ===== Effects =====
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Member from route/storage
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // API key popup once
  useEffect(() => {
    const hasShown =
      localStorage.getItem(keyFor("hasShownApiKeyPopup")) === "true";
    const anyKey = PROVIDERS.some(
      (p) => (localStorage.getItem(keyFor(`api_key_${p}`)) || "").trim() !== ""
    );
    setShowApiKeyPopup(!anyKey && !hasShown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selected provider
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
  }, [selectedAPI, apiKeys, availableProviders]);

  // --- Load chats (server first, then local fallback) ---
  // --- Load chats (server first, then local fallback) ---
  // On user switch, always start with a fresh empty chat selected (like ChatGPT).
  useEffect(() => {
    if (!email) return;

    // Detect user switch
    const last = localStorage.getItem("lastEmailUsed");
    const isSwitch = last !== email;
    localStorage.setItem("lastEmailUsed", email);

    const addFreshAndSelect = async (list) => {
      const freshId = makeId();
      const fresh = {
        id: freshId,
        name: `Chat ${list.length + 1}`,
        messages: [],
      };
      const next = [fresh, ...list];
      setChatHistory(next);
      localStorage.setItem(keyFor("chatHistory"), JSON.stringify(next));
      setSelectedChatId(freshId);
      setMessages([]);
      // best-effort remote sync
      try {
        await fetch(`${API_BASE}chats?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chats: next }),
        });
      } catch {}
    };

    const loadLocal = async () => {
      const stored = localStorage.getItem(keyFor("chatHistory"));
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (isSwitch) {
            await addFreshAndSelect(Array.isArray(parsed) ? parsed : []);
          } else {
            setChatHistory(parsed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSelectedChatId(parsed[0].id);
              setMessages(parsed[0].messages || []);
            } else {
              // No chats yet → start fresh
              await addFreshAndSelect([]);
            }
          }
          return;
        } catch {
          // fall through to fresh
        }
      }
      // No local or parse fail → start fresh list
      addFreshAndSelect([]);
    };

    const loadRemote = async () => {
      try {
        const res = await fetch(
          `${API_BASE}chats?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("No remote chats");
        const data = await res.json();
        const remoteChats = Array.isArray(data?.chats) ? data.chats : [];
        const normalized = remoteChats.map((c, idx) => ({
          id: c.id || makeId(),
          name: c.name || `Chat ${idx + 1}`,
          messages: Array.isArray(c.messages) ? c.messages : [],
        }));

        if (isSwitch) {
          await addFreshAndSelect(normalized);
        } else {
          setChatHistory(normalized);
          localStorage.setItem(
            keyFor("chatHistory"),
            JSON.stringify(normalized)
          );
          if (normalized.length > 0) {
            setSelectedChatId(normalized[0].id);
            setMessages(normalized[0].messages || []);
          } else {
            await addFreshAndSelect([]);
          }
        }
      } catch {
        // fallback to local cache on error
        await loadLocal();
      }
    };

    loadRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // --- Persist chats (local + remote) helper ---
  const persistChats = async (next) => {
    setChatHistory(next);
    localStorage.setItem(keyFor("chatHistory"), JSON.stringify(next));
    try {
      await fetch(`${API_BASE}chats?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chats: next }),
      });
    } catch {
      // silent fail → local cache still good
    }
  };

  // Keep selected chat messages synced in chatHistory + persist
  useEffect(() => {
    if (!email || !selectedChatId) return;
    setChatHistory((prev) => {
      const updated = prev.map((c) =>
        c.id === selectedChatId ? { ...c, messages: [...messages] } : c
      );
      localStorage.setItem(keyFor("chatHistory"), JSON.stringify(updated));
      // fire-and-forget remote sync
      (async () => {
        try {
          await fetch(`${API_BASE}chats?email=${encodeURIComponent(email)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chats: updated }),
          });
        } catch {}
      })();
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedChatId]);

  // Scroll button when > ~2 chats
  useEffect(() => {
    const el = chatsListRef.current;
    if (!el) return;
    const update = () =>
      setShowScrollDown(el.scrollHeight > el.clientHeight + 4);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [chatHistory.length]);

  // Load members
  useEffect(() => {
    const em = Cookies.get("userEmail");
    if (!em) return;

    fetch(`${API_BASE}getmember?email=${encodeURIComponent(em)}`)
      .then((res) => res.json())
      .then((result) => {
        if (result?.members) {
          const members = result.members
            .map((member, index) => ({
              name: `${member.firstName} ${member.lastName}`.trim(),
              memberIndex: index + 1,
              ...member,
            }))
            .filter((m) => m.firstName);
          setData(members);
          localStorage.setItem(keyFor("membersList"), JSON.stringify(members));
        }
      })
      .catch(() => {
        const cached = localStorage.getItem(keyFor("membersList"));
        if (cached) {
          try {
            setData(JSON.parse(cached));
          } catch {
            setData([]);
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Helpers =====
  const appendMessage = (sender, name, text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        name,
        text: String(text).replace(/\\n/g, "\n").replace(/\n/g, "<br>"),
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      },
    ]);
  };

  const stripHtml = (s) =>
    String(s || "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .trim();

  const deriveChatName = (msgs, fallbackIndex) => {
    const firstUser = msgs.find((m) => m.sender === "user");
    const base = stripHtml(firstUser?.text || msgs[0]?.text || "");
    const title = base.length ? base.slice(0, 40) : `Chat ${fallbackIndex}`;
    return title;
  };

  // If a chat starts empty and the first user message arrives, auto-title it
  useEffect(() => {
    if (!selectedChatId || messages.length === 0) return;
    setChatHistory((prev) => {
      const idx = prev.findIndex((c) => c.id === selectedChatId);
      if (idx === -1) return prev;
      const chat = prev[idx];
      const defaultLike = /^Chat\s+\d+$/i.test(chat.name || "");
      if (!defaultLike) return prev;
      const titled = {
        ...chat,
        name: deriveChatName(messages, idx + 1),
      };
      const next = [...prev];
      next[idx] = titled;
      // persist
      persistChats(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // ===== Actions =====
  const handleNewChat = async () => {
    // Save current chat before creating new one
    if (selectedMember && messages.length > 0) {
      await handleSaveChat();
    }

    let next = [...chatHistory];

    // Archive current thread (if any), auto-title if still default
    if (messages.length > 0) {
      if (selectedChatId) {
        next = next.map((c, idx) => {
          if (c.id !== selectedChatId) return c;
          const defaultLike = /^Chat\s+\d+$/i.test(c.name || "");
          return {
            ...c,
            name: defaultLike ? deriveChatName(messages, idx + 1) : c.name,
            messages: [...messages],
          };
        });
      } else {
        const archivedId = makeId();
        const name = deriveChatName(messages, next.length + 1);
        next = [{ id: archivedId, name, messages: [...messages] }, ...next];
      }
    }

    // Create a fresh empty chat at top
    const freshId = makeId();
    const fresh = {
      id: freshId,
      name: `Chat ${next.length + 1}`,
      messages: [],
    };
    next = [fresh, ...next];

    setSelectedChatId(freshId);
    setMessages([]);
    setUserInput("");

    // Create new history page for the current member
    if (selectedMember) {
      const historyKey = `${email}_${selectedMember.firstName}_${selectedMember.lastName}`;
      const newHistory = {
        id: freshId,
        name: `Chat ${next.length}`,
        messages: [],
        member: selectedMember,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `history_${historyKey}_${freshId}`,
        JSON.stringify(newHistory)
      );
    }

    persistChats(next);
    setIsRenamingChatId(null);
    setRenameInput("");
  };

  const handleRenameChat = (chatId, newName) => {
    const name = newName.trim();
    if (!name) {
      setIsRenamingChatId(null);
      setRenameInput("");
      return;
    }
    const next = chatHistory.map((c) => (c.id === chatId ? { ...c, name } : c));
    setIsRenamingChatId(null);
    setRenameInput("");
    persistChats(next);
  };

  const handleDeleteChat = async (chatId) => {
    const next = chatHistory.filter((c) => c.id !== chatId);
    // try server delete (optional)
    try {
      await fetch(
        `${API_BASE}chats/${encodeURIComponent(
          chatId
        )}?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );
    } catch {}
    persistChats(next);

    if (selectedChatId === chatId) {
      if (next.length > 0) {
        setSelectedChatId(next[0].id);
        setMessages(next[0].messages || []);
      } else {
        setSelectedChatId(null);
        setMessages([]);
      }
    }
  };

  const handleSelectChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (!chat) return;
    setSelectedChatId(chatId);
    setMessages(chat.messages || []);
    setUserInput("");
    setIsRenamingChatId(null);
    setRenameInput("");
  };

  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || !selectedMember) return;

    if (!selectedAPI || !(apiKeys[selectedAPI] || "").trim()) {
      if (popupClosedWithoutKey) {
        toast.warn(
          "Please enter an API key in settings, then choose a provider.",
          { autoClose: 2000 }
        );
      }
      setShowApiKeyPopup(true);
      return;
    }

    // ensure there is a selected chat; if not, create one
    if (!selectedChatId) {
      const freshId = makeId();
      const fresh = {
        id: freshId,
        name: `Chat ${chatHistory.length + 1}`,
        messages: [],
      };
      const next = [fresh, ...chatHistory];
      setSelectedChatId(freshId);
      persistChats(next);
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
        `${API_BASE}ask_ai/?query=${encodeURIComponent(
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

        const lower = errorData.toLowerCase();
        if (lower.includes("api key")) {
          appendMessage(
            "ai",
            "Medlife.ai",
            "Please provide a valid API key to continue."
          );
          setShowApiKeyPopup(true);
        } else if (lower.includes("quota")) {
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
      // messages effect will persist to history/remote
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
      toast.warn("No member selected or user email missing.", {
        autoClose: 2000,
      });
      return;
    }
    try {
      const url = `${API_BASE}saveChat/?email=${encodeURIComponent(
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
      toast.error("Error saving chat data. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const handleDownloadChat = () => {
    if (!email || !selectedMember) {
      toast.warn("No member selected or user email missing.", {
        autoClose: 2000,
      });
      return;
    }
    import("./getPdf.jsx")
      .then((m) => {
        const generatePDF = m.default;
        const formatted = messages.map((msg) => ({
          type: msg.sender,
          name: msg.name,
          message: String(msg.text || "").replace(/<br>/g, "\n"),
        }));
        const safeName =
          selectedMember.fullName ||
          `${selectedMember.firstName || ""} ${
            selectedMember.lastName || ""
          }` ||
          "Member";
        generatePDF(formatted, safeName);
      })
      .catch((err) => {
        console.error("Error loading PDF generator:", err);
        toast.error("Error generating PDF. Please try again.", {
          autoClose: 2000,
        });
      });
  };

  const handleLogout = () => {
    localStorage.removeItem(keyFor("selectedAPI"));
    localStorage.removeItem(keyFor("currentMember"));
    navigate("/signin");
  };

  const handleQuestionSelect = (q) => {
    setUserInput(q);
    const el = document.querySelector(".input-area input");
    if (el) el.focus();
  };

  const saveKeys = () => {
    const newKeys = { ...apiKeys };
    PROVIDERS.forEach((p) => {
      localStorage.setItem(keyFor(`api_key_${p}`), newKeys[p] || "");
    });

    localStorage.setItem(keyFor("hasShownApiKeyPopup"), "true");

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
          <div style={{ marginTop: "30px" }}>
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

          <div
            // className="upgrade"
            style={{
              display: "flex",
              marginTop: "50px",
              marginBottom: "10px",
              marginLeft: "10px",
              alignItems: "Left",
              justifyContent: "Left",
              gap: "6px",
              cursor: "pointer",
              color: "black",
            }}
            onClick={handleNewChat}
            title="Start a new chat"
          >
            <div style={{ display: "flex", gap: "190px" }}>
              <p> Recent Chats</p>
              <span>
                {" "}
                <Plus
                  size={18}
                  marginLeft={4}
                  marginTop={2}
                  alignItems={"left"}
                />
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                position: "relative",
                maxHeight: "350px",
                overflowY: isRenamingChatId ? "visible" : "auto",
                paddingRight: "12px",
              }}
            >
              <ul
                ref={chatsListRef}
                style={{
                  maxHeight: "350px",
                  overflowY: "auto",
                  paddingLeft: "10px",
                  scrollBehavior: "smooth",
                }}
              >
                {chatHistory.map((chat) => (
                  <li
                    key={chat.id}
                    style={{
                      listStyle: "none",
                      padding: "6px 8px",
                      backgroundColor:
                        chat.id === selectedChatId ? "#fe786b" : "transparent",
                      color: chat.id === selectedChatId ? "white" : "black",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "4px",
                      marginBottom: "4px",
                      gap: 8,
                    }}
                  >
                    <>
                      {isRenamingChatId === chat.id ? (
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameChat(chat.id, renameInput);
                            } else if (e.key === "Escape") {
                              setIsRenamingChatId(null);
                              setRenameInput("");
                            }
                          }}
                          onBlur={() => {
                            handleRenameChat(chat.id, renameInput);
                          }}
                          autoFocus
                          style={{
                            flexGrow: 1,
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                            fontSize: 14,
                            color: "black",
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => handleSelectChat(chat.id)}
                          style={{
                            flexGrow: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {chat.name}
                        </span>
                      )}
                    </>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Pencil
                        size={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRenamingChatId(chat.id);
                          setRenameInput(chat.name);
                        }}
                        style={{ cursor: "pointer", opacity: 0.7 }}
                      />
                      <Trash2
                        size={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        style={{ cursor: "pointer", opacity: 0.7 }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              {showScrollDown && (
                <button
                  onClick={() => {
                    const el = chatsListRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                  }}
                  title="Scroll to more chats"
                  style={{
                    position: "absolute",
                    right: 4,
                    bottom: 4,
                    border: "none",
                    background: "#fff",
                    boxShadow: "0 1px 6px rgba(0,0,0,.15)",
                    borderRadius: 6,
                    padding: 4,
                    cursor: "pointer",
                  }}
                >
                  <ChevronDown size={16} />
                </button>
              )}
            </div>
          </div>

          {/* <div
            className="upgrade"
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "Left",
              justifyContent: "Left",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <Home size={18} />
            Dashboard
          </div> */}
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginTop: "50px",
                  marginLeft: "10px",
                  marginRight: "20px",
                  gap: "20px",
                }}
              >
                {/* Member Selection */}
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      marginBottom: 8,
                      textAlign: "left",
                      color: "#fe786b",
                      fontSize: 16,
                    }}
                  >
                    Select member
                  </h2>
                  <select
                    value={selectedMember ? selectedMember.memberIndex : ""}
                    onChange={(e) => {
                      const selectedIndex = parseInt(e.target.value, 10);
                      const member =
                        data.find((m) => m.memberIndex === selectedIndex) ||
                        null;
                      setSelectedMember(member);
                      if (member) {
                        localStorage.setItem(
                          keyFor("currentMember"),
                          JSON.stringify(member)
                        );
                      } else {
                        localStorage.removeItem(keyFor("currentMember"));
                      }
                    }}
                    style={{
                      marginBottom: 2,
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      width: "100%",
                      color: "black",
                    }}
                  >
                    <option value="">Select Member</option>
                    {data.map((member) => (
                      <option
                        key={member.memberIndex}
                        value={member.memberIndex}
                      >
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Provider Selection */}
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      marginBottom: 8,
                      textAlign: "left",
                      color: "#fe786b",
                      fontSize: 16,
                    }}
                  >
                    AI Engine
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
                      >
                        {properName(p)}
                      </option>
                    ))}
                  </select>
                </div>
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
              {/* <button onClick={handleSaveChat}>
                <img src={cloudIcon} alt="Save" />
              </button> */}
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

      {/* Settings modal */}
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
                marginTop: 0,
                marginBottom: 14,
                fontSize: 20,
                color: "#fe786b",
              }}
            >
              Current AI Providers and API Keys
            </h2>

            <div className="api-providers-list">
              {PROVIDERS.map((provider) => {
                const hasKey = (apiKeys[provider] || "").trim() !== "";

                const maskApiKey = (key) => {
                  if (!key) return "";
                  if (key.length <= 6) return key;
                  return `${key.slice(0, 3)}${"*".repeat(
                    key.length - 6
                  )}${key.slice(-3)}`;
                };

                return (
                  <div
                    key={provider}
                    className="api-provider"
                    style={{
                      marginBottom: 14,
                      border: hasKey ? "2px solid #4CAF50" : "1px solid #ccc",
                      borderRadius: 6,
                      padding: 8,
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
                      value={
                        hasKey
                          ? maskApiKey(apiKeys[provider])
                          : apiKeys[provider]
                      }
                      onFocus={(e) => {
                        if (hasKey) e.target.value = apiKeys[provider];
                      }}
                      onBlur={(e) => {
                        if (hasKey)
                          e.target.value = maskApiKey(apiKeys[provider]);
                      }}
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
                          const input = document.getElementById(
                            `apiKey-${provider}`
                          );
                          if (input) {
                            input.focus();
                            input.setSelectionRange(
                              input.value.length,
                              input.value.length
                            );
                          }
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

      {/* First-time key prompt */}
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

            <h2 style={{ marginBottom: 10, color: "#fe8f85", fontSize: 20 }}>
              Enter Your AI API Keys
            </h2>

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
