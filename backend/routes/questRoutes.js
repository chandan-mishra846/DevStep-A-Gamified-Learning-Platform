const express = require('express');
const { 
  completeQuest,
  getQuests,
  getQuestById,
  createQuest,
  updateQuest,
  deleteQuest
} = require('../controller/questController');
const { protect, protectMentorOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all quests
router.get('/', getQuests);

// Get specific quest
router.get('/:questId', getQuestById);

// Create new quest (Mentor or Admin only - Protected)
router.post('/', protect, protectMentorOrAdmin, createQuest);

// Update quest (Mentor or Admin only - Protected)
router.put('/:questId', protect, protectMentorOrAdmin, updateQuest);

// Delete quest (Mentor or Admin only - Protected)
router.delete('/:questId', protect, protectMentorOrAdmin, deleteQuest);

// Complete a quest and earn XP (Protected)
router.post('/:questId/complete', protect, completeQuest);

module.exports = router;
