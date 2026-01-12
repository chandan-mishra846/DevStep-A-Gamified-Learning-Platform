const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Ye line add karke dekhiye ki URL aa raha hai ya nahi
    console.log("Attempting to connect with URL:", process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;