// Level Progression System
// Every level has XP threshold and unique features

const LEVEL_SYSTEM = {
  levels: [
    {
      level: 1,
      name: "🔰 The Novice",
      minXP: 0,
      maxXP: 500,
      features: [
        "✅ Access basic quests",
        "📚 Start learning journey",
        "🏆 Earn first badges",
        "⭐ XP Range: 0-500"
      ],
      description: "You are beginning your coding adventure!"
    },
    {
      level: 2,
      name: "⭐ The Learner",
      minXP: 500,
      maxXP: 1500,
      features: [
        "✅ Unlock intermediate quests",
        "💬 Start messaging users",
        "🎖️ Earn learning achievements",
        "⭐ XP Range: 500-1500"
      ],
      description: "You're making solid progress!"
    },
    {
      level: 3,
      name: "🌟 The Scholar",
      minXP: 1500,
      maxXP: 3000,
      features: [
        "✅ Access advanced quests",
        "📈 Unlock streak tracking",
        "🎖️ Earn specialty badges",
        "⭐ XP Range: 1500-3000"
      ],
      description: "You've become a true scholar!"
    },
    {
      level: 4,
      name: "💪 The Expert",
      minXP: 3000,
      maxXP: 5000,
      features: [
        "✅ Master-level quests available",
        "🔥 Unlock advanced features",
        "📊 Advanced analytics dashboard",
        "⭐ XP Range: 3000-5000"
      ],
      description: "You are becoming an expert!"
    },
    {
      level: 5,
      name: "🎓 The Mentor",
      minXP: 5000,
      maxXP: 8000,
      features: [
        "✅ Create your own quests",
        "👨‍🏫 Become a mentor (3 mentees)",
        "📝 Design learning paths",
        "🏆 Earn mentor badges",
        "⭐ XP Range: 5000-8000"
      ],
      description: "You can now guide others!"
    },
    {
      level: 6,
      name: "🚀 The Master",
      minXP: 8000,
      maxXP: 12000,
      features: [
        "✅ Create premium quests",
        "👥 Mentor up to 5 users",
        "🌟 Create learning communities",
        "🎯 Exclusive achievements",
        "⭐ XP Range: 8000-12000"
      ],
      description: "You are a master of your craft!"
    },
    {
      level: 7,
      name: "👑 The Grandmaster",
      minXP: 12000,
      maxXP: Infinity,
      features: [
        "✅ Unlimited quest creation",
        "👥 Lead community programs",
        "💎 Exclusive recognition",
        "🏅 Hall of fame entry",
        "⭐ XP Range: 12000+"
      ],
      description: "You are a legend in the community!"
    }
  ],

  // Get level info by level number
  getLevelInfo(level) {
    return this.levels[level - 1] || this.levels[0];
  },

  // Get XP needed to reach next level
  getXPToNextLevel(currentLevel, currentXP) {
    const levelInfo = this.getLevelInfo(currentLevel);
    const nextLevelXP = levelInfo.maxXP;
    return nextLevelXP - currentXP;
  },

  // Get progress percentage for level
  getLevelProgress(level, xp) {
    const levelInfo = this.getLevelInfo(level);
    const xpInCurrentLevel = xp - levelInfo.minXP;
    const xpNeededForLevel = levelInfo.maxXP - levelInfo.minXP;
    return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  },

  // Check if user can perform action based on level
  canPerformAction(level, action) {
    const actions = {
      'create_quests': 5,      // Level 5+
      'mentor': 5,             // Level 5+
      'message': 2,            // Level 2+
      'streak_tracking': 3,    // Level 3+
      'advanced_quests': 3,    // Level 3+
      'expert_quests': 4,      // Level 4+
      'master_quests': 6       // Level 6+
    };
    
    return level >= (actions[action] || 1);
  }
};

module.exports = LEVEL_SYSTEM;
