const express = require('express');
const LEVEL_SYSTEM = require('../config/levelSystem');
const router = express.Router();

// @route   GET /api/levels
// @desc    Get all levels and their info
// @access  Public
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      totalLevels: LEVEL_SYSTEM.levels.length,
      levels: LEVEL_SYSTEM.levels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/levels/:levelNumber
// @desc    Get specific level info
// @access  Public
router.get('/:levelNumber', (req, res) => {
  try {
    const { levelNumber } = req.params;
    const levelInfo = LEVEL_SYSTEM.getLevelInfo(parseInt(levelNumber));
    
    if (!levelInfo) {
      return res.status(404).json({ message: 'Level not found' });
    }

    res.status(200).json({
      success: true,
      level: levelInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/levels/progress/:level/:xp
// @desc    Get level progress percentage
// @access  Public
router.get('/progress/:level/:xp', (req, res) => {
  try {
    const { level, xp } = req.params;
    const progress = LEVEL_SYSTEM.getLevelProgress(parseInt(level), parseInt(xp));
    const xpToNext = LEVEL_SYSTEM.getXPToNextLevel(parseInt(level), parseInt(xp));

    res.status(200).json({
      success: true,
      currentLevel: parseInt(level),
      currentXP: parseInt(xp),
      progressPercentage: progress,
      xpToNextLevel: xpToNext
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
