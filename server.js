const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Make sure it's here


const app = express();
app.use(cors({
  origin: '*', // or your frontend: 'https://lenslayereddesigns.netlify.app'
  credentials: true
}));
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/user', require('./routes/user'));
app.use('/api/auth', require('./routes/auth')); // ← THIS LINE RIGHT HERE

mongoose.connect(process.env.MONGO_URI)

.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send('🚀 API is live!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});








