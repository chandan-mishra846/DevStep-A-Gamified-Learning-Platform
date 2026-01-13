const express = require('express');
const {
  sendMessage,
  getMessages,
  getConversation,
  markAsRead,
  deleteMessage
} = require('../controller/messageController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Send message (Protected)
router.post('/send', protect, sendMessage);

// Get all messages for a user (Protected)
router.get('/', protect, getMessages);

// Get conversation between two users (Protected)
router.get('/conversation/:userId', protect, getConversation);

// Mark message as read (Protected)
router.put('/:messageId/read', protect, markAsRead);

// Delete message (Protected)
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
