import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/MessageSection.css';

export default function MessageSection({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
  
  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const refreshCurrentConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const partnerId = selectedConversation.partner._id;
      const { data } = await axios.get(
        `${API_BASE_URL}/api/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allMessages = Array.isArray(data) ? data : (data?.messages || []);
      const conversationMessages = allMessages.filter(msg => 
        (msg.sender?._id === user._id && msg.receiver?._id === partnerId) ||
        (msg.sender?._id === partnerId && msg.receiver?._id === user._id)
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error refreshing conversation:', error);
    }
  };

  const fetchConversations = async (isInitialLoad = false) => {
    try {
      // Only show loading on initial load, not on polling refreshes
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const { data } = await axios.get(
        `${API_BASE_URL}/api/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Group messages by conversation partner
      const allMessages = Array.isArray(data) ? data : (data?.messages || []);
      const conversationMap = new Map();
      
      allMessages.forEach(msg => {
        const partnerId = msg.sender?._id === user._id ? msg.receiver?._id : msg.sender?._id;
        const partner = msg.sender?._id === user._id ? msg.receiver : msg.sender;
        
        if (partnerId && partner) {
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              partner,
              lastMessage: msg,
              messages: []
            });
          }
          conversationMap.get(partnerId).messages.push(msg);
          // Update last message if newer
          if (new Date(msg.createdAt) > new Date(conversationMap.get(partnerId).lastMessage.createdAt)) {
            conversationMap.get(partnerId).lastMessage = msg;
          }
        }
      });
      
      const convArray = Array.from(conversationMap.values()).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
      
      setConversations(convArray);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(true); // Initial load with loading state
    fetchUsers();
    
    // Set up polling interval
    const pollInterval = setInterval(() => {
      fetchConversations(false);
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, []);
  
  // Separate effect to refresh current conversation
  useEffect(() => {
    if (selectedConversation) {
      const refreshInterval = setInterval(() => {
        refreshCurrentConversation();
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [selectedConversation]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/users/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const usersArray = Array.isArray(data) ? data : (data?.users || []);
      setSearchResults(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSearchResults([]);
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    ));
    setShowNewChat(false);
  };

  const startNewChat = (selectedUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.partner._id === selectedUser._id);
    if (existing) {
      openConversation(existing);
    } else {
      setSelectedConversation({ partner: selectedUser, messages: [] });
      setMessages([]);
    }
    setShowNewChat(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedConversation || !messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const partnerId = selectedConversation.partner._id;
      
      const { data } = await axios.post(
        `${API_BASE_URL}/api/messages/send`,
        {
          receiverId: partnerId,
          content: messageText,
          attachmentUrl: ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add new message to current conversation
      const newMsg = {
        ...data.messageData,
        sender: { _id: user._id, name: user.name },
        receiver: selectedConversation.partner
      };
      
      setMessages([...messages, newMsg]);
      setMessageText('');
      
      // Refresh conversation list without loading state
      await fetchConversations(false);
      
      // Re-select the current conversation after refresh
      const { data: updatedMessages } = await axios.get(
        `${API_BASE_URL}/api/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allMessages = Array.isArray(updatedMessages) ? updatedMessages : (updatedMessages?.messages || []);
      const conversationMessages = allMessages.filter(msg => 
        (msg.sender?._id === user._id && msg.receiver?._id === partnerId) ||
        (msg.sender?._id === partnerId && msg.receiver?._id === user._id)
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      alert(`❌ ${errorMsg}`);
    }
  };

  const filteredUsers = searchResults.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="message-section">
      <div className="message-container">
        {/* Conversations List (Left Side) */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>💬 Chats</h3>
            <button 
              className="btn-new-chat"
              onClick={() => setShowNewChat(true)}
              title="New Chat"
            >
              ✚
            </button>
          </div>

          {loading ? (
            <p className="loading">Loading...</p>
          ) : conversations.length > 0 ? (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.partner._id}
                  className={`conversation-item ${selectedConversation?.partner._id === conv.partner._id ? 'active' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="conv-avatar">
                    {conv.partner.name[0].toUpperCase()}
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <strong>{conv.partner.name}</strong>
                      <small className="conv-time">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="conv-last-message">
                      {conv.lastMessage.sender?._id === user._id ? 'You: ' : ''}
                      {conv.lastMessage.content.substring(0, 30)}
                      {conv.lastMessage.content.length > 30 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No conversations yet</p>
          )}
        </div>

        {/* Chat Area (Right Side) */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <button 
                  className="btn-back"
                  onClick={() => setSelectedConversation(null)}
                >
                  ←
                </button>
                <div className="chat-avatar">
                  {selectedConversation.partner.name[0].toUpperCase()}
                </div>
                <div className="chat-user-info">
                  <h3>{selectedConversation.partner.name}</h3>
                  <p>Level {selectedConversation.partner.level}</p>
                </div>
              </div>

              <div className="messages-area">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    // Check if sender is current user - handle both object and string IDs
                    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                    const isSent = senderId === user._id;
                    
                    return (
                      <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                        <p className="message-text">{msg.content}</p>
                        <small className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-chat">No messages yet. Say hi! 👋</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="chat-input"
                />
                <button type="submit" className="btn-send">
                  ➤
                </button>
              </form>
            </>
          ) : showNewChat ? (
            <div className="new-chat-area">
              <div className="new-chat-header">
                <button onClick={() => setShowNewChat(false)} className="btn-back">←</button>
                <h3>New Chat</h3>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="search-input-full"
              />
              <div className="users-list-full">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="user-item-full"
                    onClick={() => startNewChat(u)}
                  >
                    <div className="user-avatar">{u.name[0].toUpperCase()}</div>
                    <div className="user-info-full">
                      <strong>{u.name}</strong>
                      <p>Level {u.level} - {u.currentLevelName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-chat-selected">
              <h2>💬 Select a chat to start messaging</h2>
              <p>Choose a conversation from the left or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
