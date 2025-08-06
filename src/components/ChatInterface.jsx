import React, { useState, useEffect, useRef } from 'react';
import './css_files/ChatInterface.css';

// Import your static images (you'll need to adjust paths based on your React setup)
import sendIcon from "../assets/images/Depth 8, Frame 0.png";
import cloudIcon from "../assets/images/cloud.jpg";
import downloadIcon from "../assets/images/download1.jpg";
import userIcon from "../assets/images/Depth 6, Frame 0.png";
import aiIcon from "../assets/images/Depth 5, Frame 0.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";

const ChatInterface = () => {
    const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Initialize component with data from localStorage
    const member = JSON.parse(localStorage.getItem('selectedMember'));
    const userEmail = localStorage.getItem('userEmail');
    
    if (!member) {
      alert('No member selected. Redirecting to dashboard...');
      // In a real app, you would use react-router to navigate
      // history.push('/dashboard');
      return;
    }
    
    setSelectedMember(member);
    setEmail(userEmail);
  }, []);

  const appendMessage = (sender, name, text) => {
    const newMessage = {
      sender,
      name,
      text: text.replace(/\\n/g, '\n').replace(/\n/g, '<br>'),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    const message = userInput.trim();
    if (!message || !selectedMember) return;

    // Add user message to chat
    appendMessage('user', 'You', message);
    setUserInput('');

    try {
      const temp = `User Details: ${JSON.stringify(selectedMember)} My question: ${message}`;
      const response = await fetch(`http://127.0.0.1:8001/medlife/prompt/?query=${encodeURIComponent(temp)}`);
      const aiResponse = await response.text();
      appendMessage('ai', 'Medlife.ai', aiResponse);
      
      // Decrement token
      await decrementToken(email, `${selectedMember.firstName} ${selectedMember.lastName}`);
    } catch (error) {
      console.error('Error:', error);
      appendMessage('ai', 'Medlife.ai', 'Sorry, something went wrong.');
    }
  };

  const handleSaveChat = async () => {
    if (!email || !selectedMember) {
      alert('No member selected or user email missing.');
      return;
    }

    const memberName = `${selectedMember.firstName} ${selectedMember.lastName}`;

    try {
      const response = await fetch(`http://127.0.0.1:8001/medlife/saveChat/?email=${encodeURIComponent(email)}&member_name=${encodeURIComponent(memberName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messages)
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Chat saved successfully!');
      } else {
        alert('Failed to save chat.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving chat.');
    }
  };

  const handleDownloadChat = async () => {
    try {
      if (!email || !selectedMember) {
        alert('No member selected or user email missing.');
        return;
      }

      const memberName = `${selectedMember.firstName} ${selectedMember.lastName}`;
      const apiUrl = `http://127.0.0.1:8001/medlife/fetchChat/?email=${encodeURIComponent(email)}&member_name=${encodeURIComponent(memberName)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error('Downloaded file is not a valid PDF.');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Chat_History_${memberName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download chat PDF. Please try again.');
    }
  };

  const decrementToken = async (email, name) => {
    const url = `http://127.0.0.1:8001/medlife/tokens/?email=${encodeURIComponent(email)}&member_name=${encodeURIComponent(name)}`;
    try {
      await fetch(url);
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/signin';
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
            onClick={() => {
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </header>
    <div className="chat-container">
      <div className="sidebar">
        <ul>
            <li>Are there any drug interactions I should be aware of?</li>
            <li>Is there any prescriptions I should be particularly concerned about if added to my list?</li>
            <li>Are there any medical symptoms I should monitor for when taking my prescriptions?</li>
           
        </ul>
        <div className="upgrade">Dashboard</div>
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
                placeholder="Message medlifeAI..."
              />
              <button onClick={handleSendMessage}><img src={sendIcon} alt="Send" /></button>
              <button onClick={handleSaveChat}><img src={cloudIcon} alt="Save" /></button>
              <button onClick={handleDownloadChat}><img src={downloadIcon} alt="Download" /></button>
            </div>
          </div>
          <div className="note">
            <p>Note: <span>medlife.ai can make mistakes. Consider checking important information.</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;