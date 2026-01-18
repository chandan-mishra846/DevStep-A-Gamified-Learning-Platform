const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('name email level');
    console.log('\n📋 All users in database:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} - ${u.email} (Level ${u.level})`);
    });

    if (users.length === 0) {
      console.log('\n⚠️ No users found! Please signup first.');
      process.exit(0);
    }

    // Test password for first user
    console.log('\n🔐 Testing password matching...');
    const testUser = users[0];
    console.log(`Testing user: ${testUser.email}`);
    
    const fullUser = await User.findById(testUser._id);
    
    // Test common passwords
    const passwords = ['123456', 'password', 'test123', '12345678'];
    
    for (const pwd of passwords) {
      const match = await fullUser.matchPassword(pwd);
      console.log(`Password "${pwd}": ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
      if (match) {
        console.log(`\n🎯 CORRECT LOGIN CREDENTIALS:`);
        console.log(`Email: ${testUser.email}`);
        console.log(`Password: ${pwd}`);
        break;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
