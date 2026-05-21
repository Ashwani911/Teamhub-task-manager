// ============================================
// Mongoose Models for ETHARA
// ============================================
const mongoose = require('mongoose');

// ---------- USER ----------
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

// Virtual field: initials (e.g. "Ashwani Kumar" → "AK")
userSchema.virtual('initials').get(function () {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

// Clean JSON output: _id → id, remove password & __v
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  }
});

// ---------- PROJECT ----------
const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.ownerId = ret.owner ? ret.owner.toString() : '';
    ret.members = (ret.members || []).map(m => m.toString());
    ret.createdAt = ret.createdAt
      ? new Date(ret.createdAt).toISOString().split('T')[0]
      : '';
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    delete ret.updatedAt;
    return ret;
  }
});

// ---------- TASK ----------
// Checklist items stored as subdocuments with a custom string id
const checklistSchema = new mongoose.Schema({
  id:   { type: String, required: true },
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
}, { _id: false });           // disable auto _id — we use our own `id`

const taskSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate:     { type: String, default: '' },
  checklist:   [checklistSchema],
}, { timestamps: true });

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.projectId = ret.project ? ret.project.toString() : '';
    ret.assigneeId = ret.assignee ? ret.assignee.toString() : '';
    ret.checklist = (ret.checklist || []).map(c => ({
      id: c.id,
      text: c.text,
      done: c.done,
    }));
    ret.createdAt = ret.createdAt
      ? new Date(ret.createdAt).toISOString().split('T')[0]
      : '';
    delete ret._id;
    delete ret.__v;
    delete ret.project;
    delete ret.assignee;
    delete ret.updatedAt;
    return ret;
  }
});

// ---------- COMMENT ----------
const commentSchema = new mongoose.Schema({
  task:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text:     { type: String, required: true },
}, { timestamps: true });

commentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.taskId = ret.task ? ret.task.toString() : '';
    ret.userId = ret.user ? ret.user.toString() : '';
    ret.createdAt = ret.createdAt
      ? new Date(ret.createdAt).toISOString()
      : '';
    delete ret._id;
    delete ret.__v;
    delete ret.task;
    delete ret.user;
    delete ret.updatedAt;
    return ret;
  }
});

// Export all models
module.exports = {
  User:    mongoose.model('User', userSchema),
  Project: mongoose.model('Project', projectSchema),
  Task:    mongoose.model('Task', taskSchema),
  Comment: mongoose.model('Comment', commentSchema),
};
