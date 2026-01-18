require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserLevel = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Show all users first
    const allUsers = await User.find().select('name email level xp');
    console.log('📋 All Users in Database:');
    allUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} - ${u.email} (Level ${u.level}, ${u.xp} XP)`);
    });

    // Find user by email - UPDATE THIS EMAIL
    const email = 'level7@gmail.com'; // ⚠️ CHANGE THIS TO YOUR EMAIL
    const user = await User.findOne({ email });

    if (!user) {
      console.log('\n❌ User not found with email:', email);
      console.log('👆 Update the email in update-level.js file');
      process.exit(1);
    }

    console.log(`\n👤 Updating User: ${user.name}`);
    console.log(`📊 Current Level: ${user.level}`);
    console.log(`⭐ Current XP: ${user.xp}`);

    // Update to Level 7 (requires 12000+ XP)
    user.xp = 12500; // Level 7
    await user.save(); // Auto level-up happens in pre-save hook

    console.log(`\n✅ Updated!`);
    console.log(`📊 New Level: ${user.level}`);
    console.log(`⭐ New XP: ${user.xp}`);
    console.log(`🎯 Level Name: ${user.currentLevelName}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateUserLevel();
