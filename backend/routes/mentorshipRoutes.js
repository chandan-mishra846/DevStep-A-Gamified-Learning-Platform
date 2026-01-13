const express = require('express');
const {
  becomeMentor,
  requestMentorship,
  acceptMentorship,
  rejectMentorship,
  removeMentee,
  getMentorshipDetails,
  getAllMentorships,
  addSession,
  endorseMentee,
  completeMentorship
} = require('../controller/mentorshipController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Mentor endpoints (Protected)
router.post('/become-mentor', protect, becomeMentor);
router.get('/mentors', protect, getAllMentorships);

// Mentorship request (Protected)
router.post('/request/:mentorId', protect, requestMentorship);
router.post('/:mentorshipId/accept', protect, acceptMentorship);
router.post('/:mentorshipId/reject', protect, rejectMentorship);

// Mentee management (Protected)
router.delete('/:mentorshipId/remove-mentee', protect, removeMentee);

// Get mentorship details (Protected)
router.get('/:mentorshipId', protect, getMentorshipDetails);

// Session tracking (Protected)
router.post('/:mentorshipId/session', protect, addSession);

// Endorsement (Protected)
router.post('/:mentorshipId/endorse', protect, endorseMentee);

// Complete mentorship (Protected)
router.post('/:mentorshipId/complete', protect, completeMentorship);

module.exports = router;
