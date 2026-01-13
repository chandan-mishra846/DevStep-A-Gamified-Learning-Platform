import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MessageSection.css';

export default function MessageSection({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showForm, setShowForm] = useState(false);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        'http://localhost:5000/api/messages',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const messagesArray = Array.isArray(data) ? data : (data?.messages || []);
      setMessages(messagesArray);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !messageText.trim()) {
      alert('Please select a user and enter a message');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/messages/send',
        {
          receiverId: selectedUser._id,
          content: messageText,
          attachmentUrl: ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageText('');
      alert('✅ Message sent!');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  return (
    <div className="message-section">
      <div className="section-header">
        <h2>💬 Messages</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Cancel' : '✉️ Send Message'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="form-group">
            <label>Select Recipient (User ID)</label>
            <input
              type="text"
              placeholder="Paste recipient user ID"
              value={selectedUser?._id || ''}
              onChange={(e) => setSelectedUser({ _id: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows="4"
          ></textarea>

          <button type="submit" className="btn-success">Send Message</button>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading messages...</p>
      ) : messages.length > 0 ? (
        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg._id} className={`message-item ${msg.sender === user._id ? 'sent' : 'received'}`}>
              <p className="message-content">{msg.content}</p>
              <small className="message-time">
                {new Date(msg.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No messages yet. Start a conversation! 💬</p>
      )}
    </div>
  );
}
