const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ message: 'User created', token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("👉 Login attempt:", { email });

  try {
    const user = await User.findOne({ email });
    console.log("🔍 Found user:", user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("❌ Invalid credentials");
      return res.status(401).json({ message: 'Invalid credentials' }); // <- fixed key
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;






