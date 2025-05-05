require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://lenslayereddesigns.netlify.app',
    'https://main--lenslayereddesigns.netlify.app' // optional preview URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT']
}));




app.use(express.json());

// Public routes (open, no token needed)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (need token)
app.use('/api/user', require('./routes/user'));
app.use('/api/misc', require('./routes/misc'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 💡 Max time to wait for Mongo before throwing an error
  socketTimeoutMS: 45000,          // 💡 Timeout for any stalled connection attempt
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));



// Root route for testing
app.get('/', (req, res) => {
  res.send('🚀 API is live!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

