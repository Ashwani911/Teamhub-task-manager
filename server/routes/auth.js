// ============================================
// Auth Routes — POST /signup, POST /login, GET /me
// ============================================
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware');

// Helper: generate a JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup — create a new account
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'member',
    });

    // Return user + token
    const token = generateToken(user);
    res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login — sign in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Try: ashwani@gmail.com' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Return user + token
    const token = generateToken(user);
    res.json({ user: user.toJSON(), token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — get current user from token
router.get('/me', auth, async (req, res) => {
  res.json(req.user.toJSON());
});

module.exports = router;
