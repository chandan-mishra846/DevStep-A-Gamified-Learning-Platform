const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("\n⚠️  SOLUTION:");
    console.log("1. Go to: https://cloud.mongodb.com");
    console.log("2. Click 'Network Access' (left sidebar)");
    console.log("3. Click 'ADD IP ADDRESS'");
    console.log("4. Enter: 0.0.0.0/0 (allow all IPs)");
    console.log("5. Wait 2-3 minutes and restart server\n");
    process.exit(1);
  }
};

module.exports = connectDB;