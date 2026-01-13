const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    // Add user to request object
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route', error: error.message });
  }
};

// @desc    Protect routes - only Admin or Mentor can access
const protectMentorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role === 'admin' || req.user.role === 'mentor') {
      next();
    } else {
      return res.status(403).json({ 
        message: 'Only Mentors and Admins can create quests. You must be Level 5+ to become a mentor.' 
      });
    }
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed', error: error.message });
  }
};

// @desc    Protect routes - only Admin can access
const protectAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Only Admins can perform this action' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed', error: error.message });
  }
};

module.exports = { protect, protectMentorOrAdmin, protectAdmin };
