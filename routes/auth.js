const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

// --- Signup ---
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

// --- Login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for ${email.slice(0, 2)}***@***`);

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ No user found:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    console.log("🎫 Token generated");
    res.status(200).json({ message: 'Login successful', token });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Token Validation ---
router.get('/validate', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Token is valid",
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ message: "Validation error" });
  }
});

module.exports = router;
