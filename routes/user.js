const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const bcrypt = require('bcrypt');
const upload = require('../middleware/upload');

// 🔐 User dashboard route
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.lastLogin = new Date();
    await user.save();

    res.json({
      username: user.username,
      lastLogin: user.lastLogin,
      uploads: user.uploads || [],
      followers: user.followers || 0,
      profilePic: user.profilePic || null
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

// ✏️ Update profile
router.put('/update', verifyToken, async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  if (username) user.username = username;
  if (email) user.email = email;

  if (newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect current password' });
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json({ message: 'Profile updated' });
});

// 🌍 Public profile view by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      uploads: user.uploads || [],
      profilePic: user.profilePic || null
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📤 Upload image
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.uploads.push(imagePath);
    await user.save();

    res.json({ success: true, path: imagePath });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload error" });
  }
});

// 🌐 All public uploads
router.get('/all-uploads', async (req, res) => {
  try {
    const users = await User.find({}, 'uploads username');
    const uploads = [];

    users.forEach(user => {
      if (Array.isArray(user.uploads)) {
        user.uploads.forEach(imgPath => {
          uploads.push({ 
            src: imgPath, 
            username: user.username || "unknown"
          });
        });
      }
    });

    res.json({ uploads });
  } catch (err) {
    console.error('❌ Failed to fetch all uploads:', err);
    res.status(500).json({ error: 'Server error fetching uploads' });
  }
});

module.exports = router;


