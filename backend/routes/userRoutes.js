const express = require('express');
const { registerUser, authUser, getAllUsers, getUserProfile, updateUserProfile, getCurrentUser } = require('../controller/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getCurrentUser);
router.get('/all', protect, getAllUsers);
router.get('/profile/:userId', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;