const User = require('../models/User');
const Mentorship = require('../models/Mentorship');

// @desc    Request to become a mentor
// @route   POST /api/mentorship/become-mentor
const becomeMentor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.canMentor) {
      return res.status(403).json({ message: 'You must be Level 5 or higher to become a mentor' });
    }
    
    user.isMentor = true;
    if (user.mentorSlots === 0) {
      user.mentorSlots = 3; // Default slots
    }
    await user.save();
    
    res.status(200).json({
      message: 'You are now a mentor!',
      mentorSlots: user.mentorSlots
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send mentorship request
// @route   POST /api/mentorship/request/:mentorId
const requestMentorship = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const menteeId = req.user._id;
    
    const mentor = await User.findById(mentorId);
    const mentee = await User.findById(menteeId);
    
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    if (mentor.activeMentees.length >= mentor.mentorSlots) {
      return res.status(400).json({ message: 'Mentor has reached maximum mentee capacity' });
    }
    
    // Check if request already exists
    const existingRequest = await Mentorship.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Mentorship request already exists' });
    }
    
    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: menteeId,
      menteeLevelAtStart: mentee.level,
      menteeLevelCurrent: mentee.level
    });
    
    res.status(201).json({
      message: 'Mentorship request sent!',
      mentorship
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept/Reject mentorship request
// @route   PUT /api/mentorship/:requestId/respond
const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    const mentorship = await Mentorship.findById(requestId).populate('mentee');
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (action === 'accept') {
      mentorship.status = 'accepted';
      
      const mentor = await User.findById(mentorship.mentor);
      const mentee = await User.findById(mentorship.mentee);
      
      mentor.activeMentees.push(mentee._id);
      mentee.myMentor = mentor._id;
      
      await mentor.save();
      await mentee.save();
      await mentorship.save();
      
      res.status(200).json({
        message: 'Mentorship accepted!',
        mentorship
      });
    } else {
      mentorship.status = 'rejected';
      await mentorship.save();
      
      res.status(200).json({
        message: 'Mentorship request rejected'
      });
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available mentors (based on user's level + 2 rule)
// @route   GET /api/mentorship/available-mentors
const getAvailableMentors = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Find mentors who are 0-2 levels above current user
    const targetLevels = [user.level, user.level + 1, user.level + 2];
    
    const mentors = await User.find({
      isMentor: true,
      level: { $in: targetLevels },
      _id: { $ne: user._id },
      $expr: { $lt: [{ $size: "$activeMentees" }, "$mentorSlots"] }
    })
    .select('name level currentLevelName mentorPoints endorsements activeMentees mentorSlots')
    .limit(20);
    
    const mentorsWithAvailability = mentors.map(mentor => ({
      _id: mentor._id,
      name: mentor.name,
      level: mentor.level,
      levelName: mentor.currentLevelName,
      mentorPoints: mentor.mentorPoints,
      endorsements: mentor.endorsements,
      availableSlots: mentor.mentorSlots - mentor.activeMentees.length,
      totalSlots: mentor.mentorSlots
    }));
    
    res.status(200).json({ mentors: mentorsWithAvailability });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Endorse a mentor
// @route   POST /api/mentorship/:mentorshipId/endorse
const endorseMentor = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { rating, message } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only mentee can endorse' });
    }
    
    if (mentorship.isEndorsed) {
      return res.status(400).json({ message: 'Already endorsed' });
    }
    
    mentorship.isEndorsed = true;
    mentorship.rating = rating;
    mentorship.endorsementMessage = message;
    await mentorship.save();
    
    // Update mentor's endorsement count
    const mentor = await User.findById(mentorship.mentor);
    mentor.endorsements += 1;
    mentor.xp += 100; // Bonus XP for endorsement
    await mentor.save();
    
    res.status(200).json({
      message: 'Mentor endorsed successfully!',
      mentorship
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept mentorship request
// @route   POST /api/mentorship/:mentorshipId/accept
const acceptMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId).populate('mentee');
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    mentorship.status = 'accepted';
    
    const mentor = await User.findById(mentorship.mentor);
    const mentee = await User.findById(mentorship.mentee);
    
    mentor.activeMentees.push(mentee._id);
    mentee.myMentor = mentor._id;
    
    await mentor.save();
    await mentee.save();
    await mentorship.save();
    
    res.status(200).json({
      message: 'Mentorship accepted!',
      mentorship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject mentorship request
// @route   POST /api/mentorship/:mentorshipId/reject
const rejectMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    mentorship.status = 'rejected';
    await mentorship.save();
    
    res.status(200).json({
      message: 'Mentorship request rejected',
      mentorship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove mentee
// @route   DELETE /api/mentorship/:mentorshipId/remove-mentee
const removeMentee = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const mentor = await User.findById(mentorship.mentor);
    const mentee = await User.findById(mentorship.mentee);
    
    mentor.activeMentees = mentor.activeMentees.filter(id => !id.equals(mentee._id));
    mentee.myMentor = null;
    
    await mentor.save();
    await mentee.save();
    
    mentorship.status = 'completed';
    await mentorship.save();
    
    res.status(200).json({
      message: 'Mentee removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mentorship details
// @route   GET /api/mentorship/:mentorshipId
const getMentorshipDetails = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId)
      .populate('mentor', 'name level currentLevelName mentorPoints')
      .populate('mentee', 'name level currentLevelName xp');
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    res.status(200).json({ mentorship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all mentorships
// @route   GET /api/mentorship
const getAllMentorships = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const mentorships = await Mentorship.find({
      $or: [{ mentor: userId }, { mentee: userId }]
    })
    .populate('mentor', 'name level currentLevelName')
    .populate('mentee', 'name level currentLevelName')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ mentorships });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add session to mentorship
// @route   POST /api/mentorship/:mentorshipId/session
const addSession = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { duration, topic, notes } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    mentorship.sessions.push({
      date: new Date(),
      duration,
      topic,
      notes
    });
    
    mentorship.messageCount += 1;
    mentorship.lastMessageAt = new Date();
    
    await mentorship.save();
    
    res.status(201).json({
      message: 'Session recorded successfully!',
      mentorship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Endorse mentee (removed - using endorseMentee instead)
const endorseMentee = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { rating, message } = req.body;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only mentor can endorse' });
    }
    
    if (mentorship.isEndorsed) {
      return res.status(400).json({ message: 'Already endorsed' });
    }
    
    mentorship.isEndorsed = true;
    mentorship.rating = rating;
    mentorship.endorsementMessage = message;
    await mentorship.save();
    
    // Update mentee's endorsement count
    const mentee = await User.findById(mentorship.mentee);
    mentee.endorsements += 1;
    mentee.xp += 100; // Bonus XP
    await mentee.save();
    
    res.status(200).json({
      message: 'Mentee endorsed successfully!',
      mentorship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete mentorship
// @route   POST /api/mentorship/:mentorshipId/complete
const completeMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }
    
    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    mentorship.status = 'completed';
    mentorship.completedAt = new Date();
    await mentorship.save();
    
    res.status(200).json({
      message: 'Mentorship completed!',
      mentorship
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
