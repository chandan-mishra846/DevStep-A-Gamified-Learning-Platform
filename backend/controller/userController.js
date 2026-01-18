const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Token Generator Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc Register User
const registerUser = async (req, res) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // New User creation (Starting with 100 XP as welcome bonus)
    const user = await User.create({ name, email, password, xp: 100 });
    console.log('✅ User created:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      level: user.level,
      xp: user.xp,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Login User
const authUser = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? `Yes (${user.name})` : 'No');

    if (user) {
      const isMatch = await user.matchPassword(password);
      console.log('🔑 Password match:', isMatch);
      
      if (isMatch) {
        console.log('✅ Login successful');
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          currentLevelName: user.currentLevelName,
          role: user.role,
          isMentor: user.isMentor,
          messageCredits: user.messageCredits,
          completedQuests: user.completedQuests,
          activeMentees: user.activeMentees,
          myMentor: user.myMentor,
          streakCount: user.streakCount,
          longestStreak: user.longestStreak,
          badges: user.badges,
          token: generateToken(user._id),
        });
      } else {
        console.log('❌ Password incorrect');
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('❌ User not found with email:', email);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all users (for messaging/search)
const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select('-password')
      .limit(20);
    
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('activeMentees', 'name level currentLevelName')
      .populate('myMentor', 'name level currentLevelName');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = req.body.name || user.name;
    user.githubProfile = req.body.githubProfile || user.githubProfile;
    user.linkedInProfile = req.body.linkedInProfile || user.linkedInProfile;
    user.portfolioUrl = req.body.portfolioUrl || user.portfolioUrl;
    user.githubRepoUrl = req.body.githubRepoUrl || user.githubRepoUrl;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      level: updatedUser.level,
      xp: updatedUser.xp,
      currentLevelName: updatedUser.currentLevelName,
      githubProfile: updatedUser.githubProfile,
      linkedInProfile: updatedUser.linkedInProfile,
      portfolioUrl: updatedUser.portfolioUrl,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current logged-in user data
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('activeMentees', 'name level currentLevelName')
      .populate('myMentor', 'name level currentLevelName')
      .populate('completedQuests');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getAllUsers, getUserProfile, updateUserProfile, getCurrentUser };