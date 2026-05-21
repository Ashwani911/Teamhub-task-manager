import React, { useState, useEffect } from 'react';
import { api, Project, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Folder, Plus, Calendar, Trash2, X, Sparkles } from 'lucide-react';

interface Props { openProject: (id: string) => void; }

export const ProjectList: React.FC<Props> = ({ openProject }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [p, u] = await Promise.all([api.getProjects(), api.getUsers()]);
    setProjects(p); setUsers(u); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !user) return;
    try {
      await api.createProject(form.name, form.description, user);
      setForm({ name: '', description: '' }); setShowModal(false); await load();
    } catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    if (user) { await api.deleteProject(id, user); await load(); }
  };

  const getMemberInitials = (project: Project) => users.filter(u => project.members.includes(u.id)).slice(0, 4).map(u => u.initials);
  const getMemberCount = (project: Project) => users.filter(u => project.members.includes(u.id)).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-500 text-sm">Manage your team's boards</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 glass border border-white/[0.04] rounded-2xl">
          <Folder className="w-14 h-14 text-gray-700 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-300">No Projects Yet</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            {user?.role === 'admin' ? 'Create your first project to get started.' : 'No projects yet.'}
          </p>
          {user?.role === 'admin' && (
            <button onClick={() => setShowModal(true)} className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">Create Project</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up" style={{ animationDelay: '0.08s' }}>
          {projects.map((project, idx) => (
            <div key={project.id} onClick={() => openProject(project.id)}
              className="glass border border-white/[0.04] rounded-2xl p-5 hover:border-indigo-500/20 transition-all cursor-pointer group card-hover"
              style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-indigo-500/8 rounded-xl border border-indigo-500/10 group-hover:bg-indigo-500/15 transition-colors">
                  <Folder className="w-5 h-5 text-indigo-400" />
                </div>
                {user?.role === 'admin' && (
                  <button onClick={e => handleDelete(e, project.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <div className="flex -space-x-2">
                  {getMemberInitials(project).map((initials, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-2 border-[#0f1120] text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                      {initials}
                    </div>
                  ))}
                  {getMemberCount(project) > 4 && (
                    <div className="w-7 h-7 rounded-full bg-white/[0.04] border-2 border-[#0f1120] text-gray-500 flex items-center justify-center text-[10px]">+{getMemberCount(project) - 4}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />{project.createdAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => { setShowModal(false); setError(''); }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl border border-indigo-500/10">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">New Project</h2>
              <p className="text-xs text-gray-500">Create a new workspace for your team</p>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Q3 Product Launch" required
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's this project about?"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm min-h-[80px] resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-white text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
    <div className="glass border border-white/[0.06] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);
