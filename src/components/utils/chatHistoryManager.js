// Chat History Manager for handling multiple history pages
import Cookies from "js-cookie";
class ChatHistoryManager {
  constructor() {
    this.currentUser =Cookies.get("userEmail");
    this.currentMember = null;
    this.historyPages = new Map();
  }

  // Generate unique key for history page
  getHistoryKey(userEmail, memberName) {
    return `${userEmail}_${memberName}`;
  }

  // Save current chat to history
  async saveCurrentChat(messages, member) {
    if (!this.currentUser || !member) return;

    const historyKey = this.getHistoryKey(this.currentUser, member.name);
    const historyData = {
      messages: messages,
      member: member,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(
      `chat_history_${historyKey}`,
      JSON.stringify(historyData)
    );

    // Save to server
    try {
      const response = await fetch(`https://semantic.onesmarter.com/medlifeV2/medlife/saveChat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.currentUser,
          member_name: member.name,
          chat: messages
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save chat to server');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  // Load chat from history
  async loadChatFromHistory(userEmail, member) {
    const historyKey = this.getHistoryKey(userEmail, member.name);
    
    // Try localStorage first
    const stored = localStorage.getItem(`chat_history_${historyKey}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try server
    try {
      const response = await fetch(
        `https://semantic.onesmarter.com/medlifeV2/medlife/fetchChat/?email=${userEmail}&member_name=${member.name}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return { messages: data.chat || [] };
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }

    return { messages: [] };
  }

  // Create new history page
  async createNewHistoryPage(userEmail, member) {
    const historyKey = this.getHistoryKey(userEmail, member.name);
    const newHistory = {
      messages: [],
      member: member,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Save empty history
    localStorage.setItem(
      `chat_history_${historyKey}`,
      JSON.stringify(newHistory)
    );

    // Save to server
    try {
      await fetch(`https://semantic.onesmarter.com/medlifeV2/medlife/saveChat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          member_name: member.name,
          chat: []
        })
      });
    } catch (error) {
      console.error('Error creating new history:', error);
    }

    return newHistory;
  }

  // Get all history pages for user
  getAllHistoryPages(userEmail) {
    const historyPages = [];
    const keys = Object.keys(localStorage);
    
    for (let key of keys) {
      if (key.startsWith(`chat_history_${userEmail}_`)) {
        const data = JSON.parse(localStorage.getItem(key));
        historyPages.push({
          key: key.replace(`chat_history_${userEmail}_`, ''),
          ...data
        });
      }
    }
    
    return historyPages;
  }

  // Switch to new member
  async switchToNewMember(newMember) {
    if (!this.currentUser) return;

    // Save current chat
    if (this.currentMember) {
      const currentMessages = this.getCurrentMessages();
      await this.saveCurrentChat(currentMessages, this.currentMember);
    }

    // Create new history page if doesn't exist
    const historyKey = this.getHistoryKey(this.currentUser, newMember.name);
    const existing = localStorage.getItem(`chat_history_${historyKey}`);
    
    if (!existing) {
      await this.createNewHistoryPage(this.currentUser, newMember);
    }

    // Update current member
    this.currentMember = newMember;
    
    // Load chat for new member
    return await this.loadChatFromHistory(this.currentUser, newMember);
  }

  getCurrentMessages() {
    // This would be implemented based on your current chat state
    return [];
  }
}

export default ChatHistoryManager;
