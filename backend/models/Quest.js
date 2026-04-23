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
  
  // Quiz settings and questions (if contentType is 'quiz')
  quizSettings: {
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    allowMultipleCorrect: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false }
  },
  quizQuestions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    // Legacy single-correct support.
    correctAnswer: { type: Number, default: null },
    // New multi-correct support for optional/multiple answers.
    correctAnswers: [{ type: Number }],
    explanation: { type: String, default: '' },
    allowMultiple: { type: Boolean, default: false }
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
