const express = require('express');
const {
  registerUser,
  authUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
  adminGetStats,
  adminGetUsers,
  adminUpdateUser,
  adminDeleteUser
} = require('../controller/userController');
const { protect, protectAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getCurrentUser);
router.get('/all', protect, getAllUsers);
router.get('/profile/:userId', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/admin/stats', protect, protectAdmin, adminGetStats);
router.get('/admin/users', protect, protectAdmin, adminGetUsers);
router.put('/admin/users/:userId', protect, protectAdmin, adminUpdateUser);
router.delete('/admin/users/:userId', protect, protectAdmin, adminDeleteUser);

module.exports = router;