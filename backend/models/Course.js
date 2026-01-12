const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  // Level mapping
  level: { type: Number, required: true, min: 1, max: 7 },
  levelName: { type: String, required: true }, // e.g., "The Architect (DSA)"
  
  // Course content
  quests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  totalXP: { type: Number, default: 0 },
  
  // Enrollment
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Metadata
  coverImage: { type: String, default: '' },
  category: { type: String, default: 'Computer Science' },
  estimatedDuration: { type: Number, default: 0 }, // in hours
  
  // Prerequisites
  prerequisiteCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  
}, { timestamps: true });

// Calculate total XP when quests are added
courseSchema.methods.calculateTotalXP = async function() {
  await this.populate('quests');
  this.totalXP = this.quests.reduce((sum, quest) => sum + (quest.xpReward || 0), 0);
  return this.totalXP;
};

module.exports = mongoose.model('Course', courseSchema);
