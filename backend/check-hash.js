const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: 'level2@gamil.com' });
  console.log('Password hash:', user.password);
  console.log('Hash length:', user.password.length);
  console.log('Is bcrypt hash:', user.password.startsWith('$2'));
  
  // Try matching with 123456
  const match = await user.matchPassword('123456');
  console.log('Password "123456" matches:', match);
  
  process.exit(0);
});
