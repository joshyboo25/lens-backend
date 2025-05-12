require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
// const morgan = require('morgan'); // Optional for logging

const app = express();

// ========== Environment Variables Check ==========
const { MONGODB_URI, PORT = 5000 } = process.env;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

// ========== Middleware ==========
app.use(express.json());
app.use(cors({
  origin: [
    'https://lenslayereddesigns.netlify.app',
    'https://main--lenslayereddesigns.netlify.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT']
}));

// app.use(morgan('dev')); // Enable logging in dev mode

// ========== MongoDB Connection ==========
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// ========== API Routes ==========
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/misc', require('./routes/misc'));

// ========== Root Test Route ==========
app.get('/', (req, res) => {
  res.status(200).json({ message: '🚀 API is live!' });
});

// ========== Optional Static File Serving ==========
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

// ========== Start Server ==========
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});