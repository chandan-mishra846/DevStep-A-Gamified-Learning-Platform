const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachmentUrl } = req.body;
    const senderId = req.user._id;
    
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if sender can message this user (+2 level rule or mentor-mentee)
    if (!sender.canMessageUser(receiver)) {
      return res.status(403).json({ 
        message: 'You can only message users up to 2 levels above you, or your mentor/mentees' 
      });
    }
    
    // Check message credits
    if (sender.messageCredits < 1) {
      return res.status(403).json({ 
        message: 'Insufficient message credits. Complete quests to earn more!' 
      });
    }
    
    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      attachmentUrl,
      isMentorshipMessage: sender.myMentor?.toString() === receiverId || 
                          sender.activeMentees?.some(m => m.toString() === receiverId)
    });
    
    // Deduct credit only for non-mentorship messages
    if (!message.isMentorshipMessage) {
      sender.messageCredits -= 1;
      await sender.save();
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message,
      creditsRemaining: sender.messageCredits
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation with a user
// @route   GET /api/messages/conversation/:userId
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name level currentLevelName')
    .populate('receiver', 'name level currentLevelName')
    .limit(100);
    
    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({ messages });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations
// @route   GET /api/messages/conversations
const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get unique users the current user has messaged with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name level currentLevelName')
    .populate('receiver', 'name level currentLevelName');
    
    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId.toString() 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
      
      if (!conversationsMap.has(partnerId)) {
        const partner = msg.sender._id.toString() === userId.toString() 
          ? msg.receiver 
          : msg.sender;
        
        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread messages
      if (msg.receiver._id.toString() === userId.toString() && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    
    res.status(200).json({ conversations });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations
};
