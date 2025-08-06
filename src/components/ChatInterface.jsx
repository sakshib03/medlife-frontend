import React, { useState, useEffect, useRef } from 'react';
import './css_files/ChatInterface.css';

// Import your static images (you'll need to adjust paths based on your React setup)
import cloudIcon from "../assets/images/cloud.jpg";
import userIcon from "../assets/images/Depth 6, Frame 0.png";
import aiIcon from "../assets/images/Depth 5, Frame 0.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Send, Download } from "lucide-react";

const ChatInterface = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [email, setEmail] = useState('');

  const appendMessage = (sender, name, text) => {
    const newMessage = {
      sender,
      name,
      text: text.replace(/\\n/g, '\n').replace(/\n/g, '<br>'),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    const message = userInput.trim();
    if (!message || !selectedMember) return;

    // Add user message to chat
    appendMessage('user', 'You', message);
    
    // Simulate AI response (replace with actual API call when available)
    const aiResponse = `This is a simulated response to: "${message}". In a real implementation, this would call the Medlife.ai API.`;
    appendMessage('ai', 'Medlife.ai', aiResponse);
    
    setUserInput('');
  };

  const handleSaveChat = () => {
    if (!email || !selectedMember) {
      alert('No member selected or user email missing.');
      return;
    }

    // Simulate saving chat to local storage (replace with actual API call when available)
    const chatKey = `chat_${email}_${selectedMember.firstName}_${selectedMember.lastName}`;
    localStorage.setItem(chatKey, JSON.stringify(messages));
    alert('Chat saved to local storage (simulated). In a real implementation, this would save to the server.');
  };

  const handleDownloadChat = () => {
    if (!email || !selectedMember) {
      alert('No member selected or user email missing.');
      return;
    }

    // Simulate downloading chat (replace with actual PDF generation when available)
    const chatText = messages.map(msg => `${msg.name}: ${msg.text.replace(/<br>/g, '\n')}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Chat_History_${selectedMember.firstName}_${selectedMember.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Text file downloaded (simulated). In a real implementation, this would download a PDF from the server.');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-section-interface">
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
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>
      <div className="chat-container">
        <div className="sidebar">
          <div>
            <h3>Recommended Health Questions</h3>
            <ul>
              <li>Are there any drug interactions I should be aware of?</li>
              <li>Is there any prescriptions I should be particularly concerned about if added to my list?</li>
              <li>Are there any medical symptoms I should monitor for when taking my prescriptions?</li>
            </ul>
          </div>
          <div>
            <div>
              <h3>Optional Questions</h3>
              <ul>
                <li>Could you display the two most influential medical articles for me?</li>
                <li>Can you provide summaries of both articles, limited to 150 words each?</li>
                <li>Are there any clinical trials which would interest me?</li>
              </ul>
            </div>
          </div>
          <div className="upgrade" onClick={() => navigate("/dashboard")}>
            Dashboard
          </div>
        </div>

        <div className="main-content">
          <div className="chat-main">
            <div className="chat-header">
              <h1>Medlife Assist</h1>
              <p>Would like to talk about your Health?</p>
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.map(message => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-header">
                    <img src={message.sender === 'user' ? userIcon : aiIcon} alt={message.name} />
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question here..."
              />
              <button onClick={handleSendMessage}><Send size={20} /></button>
              <button onClick={handleSaveChat}><img src={cloudIcon} alt="Save" /></button>
              <button onClick={handleDownloadChat}><Download size={20}/></button>
            </div>
          </div>
          <div className="note">
            <p><span>Note:</span> medlife.ai can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;