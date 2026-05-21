// ============================================
// Comment Routes — GET + POST
// ============================================
const router = require('express').Router();
const { Comment } = require('../models');
const { auth } = require('../middleware');

// GET /api/comments?taskId=xxx — get comments for a task
router.get('/', auth, async (req, res) => {
  try {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ message: 'taskId query param required' });

    const comments = await Comment.find({ task: taskId }).sort({ createdAt: 1 });
    res.json(comments.map(c => c.toJSON()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments — add a comment
router.post('/', auth, async (req, res) => {
  try {
    const { taskId, text } = req.body;
    if (!taskId || !text) {
      return res.status(400).json({ message: 'taskId and text are required' });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      userName: req.user.name,
      text,
    });

    res.status(201).json(comment.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
