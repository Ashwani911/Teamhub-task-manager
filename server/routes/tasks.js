// ============================================
// Task Routes — CRUD
// ============================================
const router = require('express').Router();
const { Task, Project, Comment } = require('../models');
const { auth, requireAdmin } = require('../middleware');

// GET /api/tasks?projectId=xxx — list tasks
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;

    if (projectId) {
      // Return tasks for a specific project
      const tasks = await Task.find({ project: projectId }).sort({ createdAt: -1 });
      return res.json(tasks.map(t => t.toJSON()));
    }

    // No projectId → return all tasks user has access to
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().select('_id');
    } else {
      projects = await Project.find({ members: req.user._id }).select('_id');
    }
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ project: { $in: projectIds } }).sort({ createdAt: -1 });
    res.json(tasks.map(t => t.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — create a task
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assigneeId, dueDate, checklist } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ message: 'Project and title are required' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      project:     projectId,
      title,
      description: description || '',
      status:      status || 'todo',
      priority:    priority || 'medium',
      assignee:    assigneeId || null,
      dueDate:     dueDate || '',
      checklist:   checklist || [],
    });

    res.status(201).json(task.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id — update a task
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, assigneeId, dueDate, checklist } = req.body;

    if (title !== undefined)       task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined)      task.status = status;
    if (priority !== undefined)    task.priority = priority;
    if (assigneeId !== undefined)  task.assignee = assigneeId || null;
    if (dueDate !== undefined)     task.dueDate = dueDate;
    if (checklist !== undefined)   task.checklist = checklist;

    await task.save();
    res.json(task.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id — admin deletes a task + its comments
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
