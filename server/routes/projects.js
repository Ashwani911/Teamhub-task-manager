// ============================================
// Project Routes — CRUD + member management
// ============================================
const router = require('express').Router();
const { Project, Task, Comment } = require('../models');
const { auth, requireAdmin } = require('../middleware');

// GET /api/projects — list projects (admin=all, member=only theirs)
router.get('/', auth, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(projects.map(p => p.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects — admin creates a project
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [req.user._id],   // creator is first member
    });

    res.status(201).json(project.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id — admin deletes project + its tasks + comments
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Cascade: delete all tasks in this project
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map(t => t._id);

    // Cascade: delete all comments on those tasks
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/projects/:id/members — add or remove a member
router.patch('/:id/members', auth, requireAdmin, async (req, res) => {
  try {
    const { userId, action } = req.body; // action = 'add' | 'remove'

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (action === 'add') {
      // Add member if not already in
      if (!project.members.some(m => m.toString() === userId)) {
        project.members.push(userId);
      }
    } else if (action === 'remove') {
      project.members = project.members.filter(m => m.toString() !== userId);
    } else {
      return res.status(400).json({ message: 'Action must be add or remove' });
    }

    await project.save();
    res.json(project.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
