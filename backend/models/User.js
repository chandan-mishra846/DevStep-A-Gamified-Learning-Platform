const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Gamification & Progression
  level: { type: Number, default: 1, min: 1, max: 7 }, // 7 levels total
  xp: { type: Number, default: 0 },
  currentLevelName: { type: String, default: 'The Novice' },
  
  // Track completed quests and milestones
  completedQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  currentQuest: { type: mongoose.Schema.Types.ObjectId, ref: 'Quest' },
  
  // Streak tracking
  lastLoginDate: { type: Date },
  streakCount: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  
  // Mentorship System
  isMentor: { type: Boolean, default: false },
  canMentor: { type: Boolean, default: false }, // Eligible to become mentor (Level 5+)
  mentorSlots: { type: Number, default: 0, max: 5 }, // Max mentees at a time
  activeMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  myMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mentorPoints: { type: Number, default: 0 }, // Extra XP for mentoring
  endorsements: { type: Number, default: 0 }, // From mentees
  
  // Professional Links
  githubProfile: { type: String, default: "" },
  linkedInProfile: { type: String, default: "" },
  portfolioUrl: { type: String, default: "" },
  
  // Proof of Work (for Level 3 verification)
  githubRepoUrl: { type: String, default: "" },
  isProjectVerified: { type: Boolean, default: false },
  
  // Resume Builder Data
  resumeGenerated: { type: Boolean, default: false },
  resumeUrl: { type: String, default: "" },
  
  // Badges System
  badges: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  // Artifacts (Digital Collectibles)
  artifacts: [{
    name: String,
    description: String,
    level: Number,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  // Study Heatmap Data (for visualization)
  activityLog: [{
    date: { type: Date, default: Date.now },
    studyHours: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 }
  }],
  
  // Messaging Credits (to prevent spam)
  messageCredits: { type: Number, default: 10 }
}, { timestamps: true });

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Auto Level-Up Logic (Mongoose Middleware)
userSchema.pre('save', function(next) {
  const levelThresholds = [
    { level: 1, minXP: 0, name: 'The Novice', badge: 'Hello World' },
    { level: 2, minXP: 500, name: 'The Architect', badge: 'Logic Master' },
    { level: 3, minXP: 1500, name: 'The Builder', badge: 'Ship It!' },
    { level: 4, minXP: 3000, name: 'The Marketer', badge: 'Profile Pro' },
    { level: 5, minXP: 5000, name: 'The Corporate Scout', badge: 'Inside Man' },
    { level: 6, minXP: 8000, name: 'The Gladiator', badge: 'Battle Ready' },
    { level: 7, minXP: 12000, name: 'The Legend', badge: 'Hired!' }
  ];
  
  // Determine level based on XP
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (this.xp >= levelThresholds[i].minXP) {
      const oldLevel = this.level;
      this.level = levelThresholds[i].level;
      this.currentLevelName = levelThresholds[i].name;
      
      // Enable mentor eligibility at Level 5+
      if (this.level >= 5) {
        this.canMentor = true;
        if (!this.isMentor) {
          this.mentorSlots = 3; // Default slots when becoming eligible
        }
      }
      
      // Award level-up badge if not already awarded
      if (oldLevel < this.level) {
        const badgeExists = this.badges.some(b => b.name === levelThresholds[i].badge);
        if (!badgeExists) {
          this.badges.push({
            name: levelThresholds[i].badge,
            description: `Unlocked by reaching Level ${this.level}`,
            icon: `level-${this.level}-badge`
          });
        }
        
        // Award artifact for reaching level
        this.artifacts.push({
          name: this.level === 3 ? 'The Golden Keyboard' : 
                this.level === 7 ? 'The Offer Letter Cape' : `Level ${this.level} Trophy`,
          description: `Earned by completing Level ${oldLevel}`,
          level: this.level
        });
      }
      
      break;
    }
  }
  
  next();
});

// Update streak on login
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastLoginDate) {
    this.streakCount = 1;
    this.lastLoginDate = today;
    return;
  }
  
  const lastLogin = new Date(this.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastLogin;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays === 1) {
    // Consecutive day
    this.streakCount += 1;
    if (this.streakCount > this.longestStreak) {
      this.longestStreak = this.streakCount;
    }
  } else if (diffDays > 1) {
    // Streak broken
    this.streakCount = 1;
  }
  // If same day, don't change streak
  
  this.lastLoginDate = today;
};

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user can message another user (+2 level rule)
userSchema.methods.canMessageUser = function(targetUser) {
  // If mentor-mentee relationship, always allow
  if (this.myMentor && this.myMentor.toString() === targetUser._id.toString()) {
    return true;
  }
  if (this.activeMentees && this.activeMentees.some(m => m.toString() === targetUser._id.toString())) {
    return true;
  }
  
  // Otherwise, check +2 level rule
  const levelDiff = targetUser.level - this.level;
  return levelDiff >= 0 && levelDiff <= 2;
};

module.exports = mongoose.model('User', userSchema);