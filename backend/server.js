const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');




// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON data handle karne ke liye

// Basic Routes
app.get('/', (req, res) => {
  res.send('🚀 DevStep API is Running and DB is Connected!');
});

app.use('/api/users', userRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server is running on http://localhost:${PORT}`);
});