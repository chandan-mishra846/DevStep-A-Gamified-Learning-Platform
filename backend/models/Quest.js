const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Level requirement
  requiredLevel: { type: Number, required: true, min: 1, max: 7 },
  
  // Content
  contentType: { 
    type: String, 
    enum: ['video', 'article', 'quiz', 'project', 'coding-challenge'],
    required: true 
  },
  contentUrl: { type: String }, // YouTube, Article link, etc.
  
  // Difficulty and Rewards
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  xpReward: { type: Number, required: true },
  
  // Quiz questions (if contentType is 'quiz')
  quizQuestions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // Index of correct option
    explanation: String
  }],
  
  // Project requirements (if contentType is 'project')
  projectRequirements: {
    minCommits: { type: Number, default: 5 },
    requiredTech: [String], // ['React', 'Node.js']
    verificationNeeded: { type: Boolean, default: true }
  },
  
  // Stats
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  averageCompletionTime: { type: Number, default: 0 }, // in minutes
  
  // Order in the course
  orderIndex: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
