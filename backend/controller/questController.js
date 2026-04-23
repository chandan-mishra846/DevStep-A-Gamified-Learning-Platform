const User = require('../models/User');
const Quest = require('../models/Quest');

const normalizeQuizQuestions = (quizQuestions = []) => {
  if (!Array.isArray(quizQuestions)) return [];
  return quizQuestions
    .map((q) => {
      const options = Array.isArray(q.options) ? q.options : [];
      const hasMulti = Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0;
      const normalizedCorrectAnswers = hasMulti
        ? q.correctAnswers.map((a) => Number(a)).filter(Number.isInteger)
        : Number.isInteger(Number(q.correctAnswer))
          ? [Number(q.correctAnswer)]
          : [];

      return {
        question: q.question,
        options,
        allowMultiple: hasMulti || !!q.allowMultiple,
        correctAnswer: hasMulti ? null : (normalizedCorrectAnswers[0] ?? null),
        correctAnswers: normalizedCorrectAnswers,
        explanation: q.explanation || ''
      };
    })
    .filter((q) => q.question && q.options?.length >= 2 && q.correctAnswers?.length > 0);
};

const normalizeQuizSettings = (quizSettings = {}) => ({
  passingScore: Number.isFinite(Number(quizSettings.passingScore)) ? Number(quizSettings.passingScore) : 60,
  allowMultipleCorrect: !!quizSettings.allowMultipleCorrect,
  shuffleOptions: !!quizSettings.shuffleOptions
});

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

    if (quest.contentType === 'quiz') {
      return res.status(400).json({
        message: 'Quiz quests must be attempted via quiz submission.'
      });
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
    const { answers } = req.body; // Array of answer index or index-array per question
    const userId = req.user._id;
    
    const quest = await Quest.findById(questId);
    if (!quest || quest.contentType !== 'quiz') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const user = await User.findById(userId);
    
    // Calculate score
    let correctCount = 0;
    const results = quest.quizQuestions.map((q, index) => {
      const submitted = answers[index];
      const expectedAnswers = Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
        ? q.correctAnswers.map(Number).sort((a, b) => a - b)
        : (Number.isInteger(q.correctAnswer) ? [Number(q.correctAnswer)] : []);
      const submittedAnswers = Array.isArray(submitted)
        ? submitted.map(Number).filter(Number.isInteger).sort((a, b) => a - b)
        : (Number.isInteger(Number(submitted)) ? [Number(submitted)] : []);
      const isCorrect = expectedAnswers.length > 0 &&
        expectedAnswers.length === submittedAnswers.length &&
        expectedAnswers.every((ans, i) => ans === submittedAnswers[i]);
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        yourAnswer: submittedAnswers,
        correctAnswer: expectedAnswers,
        isCorrect,
        explanation: q.explanation
      };
    });
    
    const scorePercentage = (correctCount / quest.quizQuestions.length) * 100;
    const passingScore = quest.quizSettings?.passingScore ?? 60;
    const passed = scorePercentage >= passingScore;

    // Award XP strictly based on quiz score.
    const xpEarned = Math.max(0, Math.round((quest.xpReward * scorePercentage) / 100));

    const oldLevel = user.level;
    user.xp += xpEarned;
    user.completedQuests.push(questId);
    await user.save();

    quest.completedBy.push(userId);
    await quest.save();

    return res.status(200).json({
      passed,
      score: scorePercentage,
      correctCount,
      totalQuestions: quest.quizQuestions.length,
      xpEarned,
      totalXP: user.xp,
      leveledUp: user.level > oldLevel,
      currentLevel: user.level,
      message: passed ? 'Quiz completed successfully.' : 'Quiz completed. Keep improving your score.',
      results
    });
    
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

// @desc    Get all quests
// @route   GET /api/quests
const getQuests = async (req, res) => {
  try {
    const { level, difficulty } = req.query;
    let filter = {};
    
    if (level) filter.requiredLevel = parseInt(level);
    if (difficulty) filter.difficulty = difficulty;
    
    const quests = await Quest.find(filter)
      .sort({ orderIndex: 1 })
      .select('title description requiredLevel difficulty xpReward contentType contentUrl');
    
    res.status(200).json({ quests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific quest by ID
// @route   GET /api/quests/:questId
const getQuestById = async (req, res) => {
  try {
    const { questId } = req.params;
    
    const quest = await Quest.findById(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    res.status(200).json({ quest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new quest (admin only)
// @route   POST /api/quests
const createQuest = async (req, res) => {
  try {
    const { title, description, requiredLevel, contentType, contentUrl, difficulty, xpReward, quizQuestions, quizSettings, projectRequirements } = req.body;
    const normalizedQuizQuestions = normalizeQuizQuestions(quizQuestions);
    const normalizedQuizSettings = normalizeQuizSettings(quizSettings);

    if (contentType === 'quiz' && normalizedQuizQuestions.length === 0) {
      return res.status(400).json({
        message: 'Quiz quests require quizQuestions with valid options and correct answers.'
      });
    }
    
    const quest = await Quest.create({
      title,
      description,
      requiredLevel,
      contentType,
      contentUrl,
      difficulty,
      xpReward,
      quizQuestions: normalizedQuizQuestions,
      quizSettings: normalizedQuizSettings,
      projectRequirements
    });
    
    res.status(201).json({
      message: 'Quest created successfully!',
      quest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quest
// @route   PUT /api/quests/:questId
const updateQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    const updateData = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updateData, 'quizQuestions')) {
      updateData.quizQuestions = normalizeQuizQuestions(updateData.quizQuestions);
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'quizSettings')) {
      updateData.quizSettings = normalizeQuizSettings(updateData.quizSettings);
    }
    if (updateData.contentType === 'quiz' && Array.isArray(updateData.quizQuestions) && updateData.quizQuestions.length === 0) {
      return res.status(400).json({
        message: 'Quiz quests require at least one valid quiz question.'
      });
    }
    
    const quest = await Quest.findByIdAndUpdate(
      questId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    res.status(200).json({
      message: 'Quest updated successfully!',
      quest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete quest
// @route   DELETE /api/quests/:questId
const deleteQuest = async (req, res) => {
  try {
    const { questId } = req.params;
    
    const quest = await Quest.findByIdAndDelete(questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    res.status(200).json({ message: 'Quest deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  completeQuest,
  submitQuiz,
  getQuests,
  getQuestById,
  createQuest,
  updateQuest,
  deleteQuest
};
