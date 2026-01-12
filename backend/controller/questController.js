const User = require('../models/User');
const Quest = require('../models/Quest');

// @desc    Complete a quest and award XP
// @route   POST /api/quests/:questId/complete
const completeQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user._id; // Assumes auth middleware sets req.user
    
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    const user = await User.findById(userId);
    
    // Check if user meets level requirement
    if (user.level < quest.requiredLevel) {
      return res.status(403).json({ message: `Level ${quest.requiredLevel} required to attempt this quest` });
    }
    
    // Check if already completed
    if (user.completedQuests.includes(questId)) {
      return res.status(400).json({ message: 'Quest already completed' });
    }
    
    // Award XP
    const oldLevel = user.level;
    user.xp += quest.xpReward;
    user.completedQuests.push(questId);
    user.currentQuest = null;
    
    // Log activity for heatmap
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLog = user.activityLog.find(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
    
    if (todayLog) {
      todayLog.quizzesCompleted += 1;
      todayLog.xpEarned += quest.xpReward;
    } else {
      user.activityLog.push({
        date: today,
        quizzesCompleted: 1,
        xpEarned: quest.xpReward
      });
    }
    
    await user.save(); // Auto level-up happens in pre-save hook
    
    // Update quest stats
    quest.completedBy.push(userId);
    await quest.save();
    
    const leveledUp = user.level > oldLevel;
    
    res.status(200).json({
      message: 'Quest completed successfully!',
      xpEarned: quest.xpReward,
      totalXP: user.xp,
      currentLevel: user.level,
      levelName: user.currentLevelName,
      leveledUp,
      newBadges: leveledUp ? user.badges.slice(-1) : []
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/quests/:questId/submit-quiz
const submitQuiz = async (req, res) => {
  try {
    const { questId } = req.params;
    const { answers } = req.body; // Array of answer indices
    const userId = req.user._id;
    
    const quest = await Quest.findById(questId);
    if (!quest || quest.contentType !== 'quiz') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const user = await User.findById(userId);
    
    // Calculate score
    let correctCount = 0;
    const results = quest.quizQuestions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        yourAnswer: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });
    
    const scorePercentage = (correctCount / quest.quizQuestions.length) * 100;
    const passed = scorePercentage >= 60; // 60% passing threshold
    
    if (passed) {
      // Award XP based on performance
      const xpMultiplier = scorePercentage >= 90 ? 1.5 : scorePercentage >= 75 ? 1.2 : 1.0;
      const xpEarned = Math.floor(quest.xpReward * xpMultiplier);
      
      const oldLevel = user.level;
      user.xp += xpEarned;
      user.completedQuests.push(questId);
      await user.save();
      
      quest.completedBy.push(userId);
      await quest.save();
      
      return res.status(200).json({
        passed: true,
        score: scorePercentage,
        correctCount,
        totalQuestions: quest.quizQuestions.length,
        xpEarned,
        totalXP: user.xp,
        leveledUp: user.level > oldLevel,
        currentLevel: user.level,
        results
      });
    } else {
      return res.status(200).json({
        passed: false,
        score: scorePercentage,
        correctCount,
        totalQuestions: quest.quizQuestions.length,
        message: 'Keep trying! You need 60% to pass.',
        results
      });
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's dashboard stats
// @route   GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('currentQuest')
      .populate('myMentor', 'name level currentLevelName')
      .populate('activeMentees', 'name level currentLevelName');
    
    // Calculate progress to next level
    const levelThresholds = [0, 500, 1500, 3000, 5000, 8000, 12000];
    const currentThreshold = levelThresholds[user.level - 1];
    const nextThreshold = user.level < 7 ? levelThresholds[user.level] : currentThreshold;
    const progressPercentage = ((user.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        level: user.level,
        levelName: user.currentLevelName,
        xp: user.xp,
        progressToNextLevel: Math.min(progressPercentage, 100),
        xpNeeded: Math.max(0, nextThreshold - user.xp),
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        badges: user.badges,
        artifacts: user.artifacts,
        completedQuests: user.completedQuests.length,
        isMentor: user.isMentor,
        canMentor: user.canMentor,
        mentorPoints: user.mentorPoints,
        activeMentees: user.activeMentees,
        myMentor: user.myMentor,
        messageCredits: user.messageCredits
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;
    
    const topUsers = await User.find()
      .sort({ xp: -1, level: -1 })
      .limit(parseInt(limit))
      .select('name level currentLevelName xp badges streakCount');
    
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      level: user.level,
      levelName: user.currentLevelName,
      xp: user.xp,
      badgeCount: user.badges.length,
      streak: user.streakCount
    }));
    
    res.status(200).json({ leaderboard, period });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  completeQuest, 
  submitQuiz, 
  getDashboard, 
  getLeaderboard 
};
