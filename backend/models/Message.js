const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Message content
  content: { type: String, required: true },
  attachmentUrl: { type: String }, // For code snippets, images
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  
  // Context
  isMentorshipMessage: { type: Boolean, default: false },
  mentorshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentorship' },
  
  // Credits deducted (for spam prevention)
  creditsUsed: { type: Number, default: 1 },
  
}, { timestamps: true });

// Index for fast querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
