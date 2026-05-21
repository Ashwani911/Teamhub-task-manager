// ============================================
// User Routes — CRUD + role management
// ============================================
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User, Project, Task } = require('../models');
const { auth, requireAdmin } = require('../middleware');

// GET /api/users — list all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users.map(u => u.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users — admin creates a new user
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password || '123456789', 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'member',
    });

    res.status(201).json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id — edit user profile (self or admin)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const isSelf = req.user._id.toString() === id;

    // Only self or admin can edit
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can edit other profiles' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password } = req.body;

    // Check email uniqueness
    if (email && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (taken) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role — admin changes user role
router.patch('/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or member' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — admin removes a user
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Can't delete yourself
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'You cannot remove yourself' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove user from all project member lists
    await Project.updateMany({}, { $pull: { members: user._id } });

    // Unassign their tasks
    await Task.updateMany({ assignee: user._id }, { $set: { assignee: null } });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
