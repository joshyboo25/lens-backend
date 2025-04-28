const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

// --- Signup (NO verifyToken here!) ---
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ message: 'User created', token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ message: err.message || 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("👉 Login attempt:", email, password); // LOG what frontend is sending

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ No user found for:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("🔍 Found user:", user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 bcrypt.compare result:", isMatch); // ← Check TRUE or FALSE

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// auth.js (backend Express route)
router.get('/validate', verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});



module.exports = router;

