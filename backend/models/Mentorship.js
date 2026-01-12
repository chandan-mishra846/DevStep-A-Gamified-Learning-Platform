const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Request status
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  
  // Communication
  lastMessageAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  
  // Progress tracking
  menteeLevelAtStart: { type: Number, required: true },
  menteeLevelCurrent: { type: Number, required: true },
  goalsSet: [String],
  goalsCompleted: [String],
  
  // Endorsement
  isEndorsed: { type: Boolean, default: false },
  endorsementMessage: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  
  // Session tracking
  sessions: [{
    date: { type: Date, default: Date.now },
    duration: Number, // in minutes
    topic: String,
    notes: String
  }],
  
  // Completion
  completedAt: { type: Date },
  
}, { timestamps: true });

// Award mentor XP when mentee levels up
mentorshipSchema.methods.awardMentorXP = async function() {
  const User = mongoose.model('User');
  const mentor = await User.findById(this.mentor);
  
  if (mentor) {
    const levelGain = this.menteeLevelCurrent - this.menteeLevelAtStart;
    const bonusXP = levelGain * 200; // 200 XP per level mentee gains
    
    mentor.xp += bonusXP;
    mentor.mentorPoints += bonusXP;
    await mentor.save();
  }
};

module.exports = mongoose.model('Mentorship', mentorshipSchema);
