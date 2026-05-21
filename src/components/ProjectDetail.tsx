import React, { useState, useEffect } from 'react';
import { api, Project, Task, User, Comment, ChecklistItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ProjectList';
import { 
  ArrowLeft, Plus, LayoutGrid, List, CheckSquare, 
  MessageSquare, Trash2, Users
} from 'lucide-react';

interface Props {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<Props> = ({ projectId, onBack }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Form state
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as const, assigneeId: '', dueDate: '' });

  const load = async () => {
    const [projects, taskList, userList] = await Promise.all([
      api.getProjects(), api.getTasks(projectId), api.getUsers()
    ]);
    setProject(projects.find(p => p.id === projectId) || null);
    setTasks(taskList);
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId]);

  const loadComments = async (taskId: string) => {
    setComments(await api.getComments(taskId));
  };

  // Task CRUD
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.createTask({
      projectId,
      title: form.title,
      description: form.description,
      status: 'todo',
      priority: form.priority,
      assigneeId: form.assigneeId || user!.id,
      dueDate: form.dueDate,
      checklist: [],
    });
    setForm({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' });
    setShowNewTask(false);
    await load();
  };

  const updateStatus = async (taskId: string, status: Task['status']) => {
    await api.updateTask(taskId, { status });
    if (selectedTask?.id === taskId) setSelectedTask(prev => prev ? { ...prev, status } : null);
    await load();
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await api.deleteTask(taskId);
    setSelectedTask(null);
    await load();
  };

  // Checklist
  const toggleCheck = async (task: Task, checkId: string) => {
    const updated = task.checklist.map(c => c.id === checkId ? { ...c, done: !c.done } : c);
    await api.updateTask(task.id, { checklist: updated });
    setSelectedTask(prev => prev ? { ...prev, checklist: updated } : null);
    await load();
  };

  const addCheck = async (task: Task, text: string) => {
    const newCheck: ChecklistItem = { id: Math.random().toString(36).substr(2, 6), text, done: false };
    await api.updateTask(task.id, { checklist: [...task.checklist, newCheck] });
    setSelectedTask(prev => prev ? { ...prev, checklist: [...(prev?.checklist || []), newCheck] } : null);
    await load();
  };

  // Comments
  const addComment = async (taskId: string, text: string) => {
    if (!user) return;
    const newComment = await api.addComment(taskId, text, user);
    setComments([...comments, newComment]);
  };

  // Team management
  const toggleMember = async (userId: string, isMember: boolean) => {
    if (!user) return;
    await api.updateProjectMembers(projectId, userId, !isMember, user);
    await load();
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const columns: { status: Task['status']; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'border-gray-500' },
    { status: 'in-progress', label: 'In Progress', color: 'border-indigo-500' },
    { status: 'review', label: 'Review', color: 'border-amber-500' },
    { status: 'done', label: 'Done', color: 'border-emerald-500' },
  ];

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm animate-slide-up">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass border border-white/[0.04] rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
          <p className="text-gray-500 text-sm">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'board' ? 'list' : 'board')}
            className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded-xl transition-colors"
            title={view === 'board' ? 'List View' : 'Board View'}
          >
            {view === 'board' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowTeam(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded-xl text-sm transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Team ({project.members.length})
          </button>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {columns.map((col, idx) => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-3 min-h-[300px]" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={`border-t-2 ${col.color} pt-2 mb-3 flex items-center justify-between`}>
                  <span className="text-sm font-semibold text-gray-300">{col.label}</span>
                  <span className="text-xs text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} users={users} onClick={() => { setSelectedTask(task); loadComments(task.id); }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="glass border border-white/[0.04] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Task</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredTasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                return (
                  <tr
                    key={task.id}
                    onClick={() => { setSelectedTask(task); loadComments(task.id); }}
                    className="hover:bg-gray-700/20 cursor-pointer text-gray-300"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-white">{task.title}</span>
                        {assignee && (
                          <span className="text-xs text-gray-500">• {assignee.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{task.dueDate || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTask && (
        <Modal onClose={() => setShowNewTask(false)}>
          <h2 className="text-lg font-bold text-white mb-4">New Task</h2>
          <form onSubmit={createTask} className="space-y-3">
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 min-h-[60px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as any })}
                className="bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none"
              >
                <option value="low">🍃 Low</option>
                <option value="medium">⚡ Medium</option>
                <option value="high">🔥 High</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none"
              />
            </div>
            <select
              value={form.assigneeId}
              onChange={e => setForm({ ...form, assigneeId: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none"
            >
              <option value="">Assign to me</option>
              {users.filter(u => project.members.includes(u.id)).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewTask(false)} className="px-4 py-2 text-gray-400 text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          comments={comments}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={updateStatus}
          onDelete={deleteTask}
          onToggleCheck={toggleCheck}
          onAddCheck={addCheck}
          onAddComment={addComment}
          isAdmin={user?.role === 'admin'}
        />
      )}

      {/* Team Modal */}
      {showTeam && (
        <Modal onClose={() => setShowTeam(false)}>
          <h2 className="text-lg font-bold text-white mb-4">Project Members</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {users.map(u => {
              const isMember = project.members.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                      {u.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.role}</p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => toggleMember(u.id, isMember)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isMember ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                      }`}
                    >
                      {isMember ? 'Remove' : 'Add'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
};

// Sub-components
const TaskCard = ({ task, users, onClick }: { task: Task; users: User[]; onClick: () => void }) => {
  const assignee = users.find(u => u.id === task.assigneeId);
  const doneChecks = task.checklist.filter(c => c.done).length;
  const totalChecks = task.checklist.length;

  return (
    <div onClick={onClick} className="bg-white/[0.03] rounded-xl p-3 cursor-pointer hover:bg-white/[0.06] border border-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="flex items-start justify-between mb-2">
        <PriorityBadge priority={task.priority} />
        {assignee && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold" title={assignee.name}>
            {assignee.initials}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-white mb-1">{task.title}</p>
      {task.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{task.description}</p>}
      
      {totalChecks > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${(doneChecks/totalChecks)*100}%` }} />
          </div>
          <span className="text-[10px] text-gray-500">{doneChecks}/{totalChecks}</span>
        </div>
      )}
      
      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
        <span>{task.dueDate || 'No date'}</span>
      </div>
    </div>
  );
};

const TaskDetailModal = ({
  task, users, comments, onClose, onUpdateStatus, onDelete, onToggleCheck, onAddCheck, onAddComment, isAdmin
}: {
  task: Task; users: User[]; comments: Comment[];
  onClose: () => void; onUpdateStatus: (id: string, s: Task['status']) => void;
  onDelete: (id: string) => void; onToggleCheck: (t: Task, id: string) => void;
  onAddCheck: (t: Task, text: string) => void; onAddComment: (id: string, text: string) => void;
  isAdmin?: boolean;
}) => {
  const [newCheck, setNewCheck] = useState('');
  const [newComment, setNewComment] = useState('');
  const assignee = users.find(u => u.id === task.assigneeId);

  const handleAddCheck = () => {
    if (!newCheck.trim()) return;
    onAddCheck(task, newCheck);
    setNewCheck('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task.id, newComment);
    setNewComment('');
  };

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <PriorityBadge priority={task.priority} />
            <h2 className="text-lg font-bold text-white mt-2">{task.title}</h2>
          </div>
          {isAdmin && (
            <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-4">{task.description || 'No description'}</p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div>
            <label className="text-gray-500 text-xs">Status</label>
            <select
              value={task.status}
              onChange={e => onUpdateStatus(task.id, e.target.value as Task['status'])}
              className="w-full mt-1 bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs">Due Date</label>
            <p className="mt-1 text-gray-300">{task.dueDate || 'No date'}</p>
          </div>
          <div>
            <label className="text-gray-500 text-xs">Assignee</label>
            <p className="mt-1 text-gray-300">{assignee?.name || 'Unassigned'}</p>
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" /> Checklist
          </h3>
          <div className="space-y-1.5 mb-3">
            {task.checklist.map(c => (
              <label key={c.id} className="flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg cursor-pointer">
                <input type="checkbox" checked={c.done} onChange={() => onToggleCheck(task, c.id)} className="accent-indigo-500" />
                <span className={`text-sm ${c.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{c.text}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCheck}
              onChange={e => setNewCheck(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCheck()}
              placeholder="Add item..."
              className="flex-1 bg-gray-700/30 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            />
            <button onClick={handleAddCheck} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg">Add</button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" /> Comments
          </h3>
          <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-3">No comments yet</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-2 bg-gray-700/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{c.userName}</span>
                    <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{c.text}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-700/30 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            />
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg">Send</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

const StatusBadge = ({ status }: { status: Task['status'] }) => {
  const styles: Record<string, string> = {
    'todo': 'bg-gray-500/20 text-gray-400',
    'in-progress': 'bg-indigo-500/20 text-indigo-400',
    'review': 'bg-amber-500/20 text-amber-400',
    'done': 'bg-emerald-500/20 text-emerald-400',
  };
  const labels: Record<string, string> = {
    'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done'
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
};

const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
  const styles: Record<string, string> = {
    low: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-rose-500/20 text-rose-400',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[priority]}`}>{priority}</span>;
};