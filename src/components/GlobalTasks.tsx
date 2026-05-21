import React, { useState, useEffect } from 'react';
import { api, Task, Project } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

export type TaskFilter = 'pending' | 'completed' | 'overdue' | 'all';

interface Props {
  initialFilter: TaskFilter;
  openProject: (projectId: string) => void;
  onBack: () => void;
}

export const GlobalTasks: React.FC<Props> = ({ initialFilter, openProject, onBack }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);

  useEffect(() => {
    Promise.all([api.getTasks(), api.getProjects()])
      .then(([t, p]) => { setTasks(t); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  const isOverdue = (task: Task) => task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  const visibleTasks = tasks.filter(t => {
    if (user?.role === 'admin') return true;
    const project = projects.find(p => p.id === t.projectId);
    return project?.members.includes(user?.id || '');
  });

  const filteredTasks = visibleTasks.filter(t => {
    if (filter === 'completed') return t.status === 'done';
    if (filter === 'pending') return t.status !== 'done';
    if (filter === 'overdue') return isOverdue(t);
    return true;
  });

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-6 h-6 text-amber-400" />,
    completed: <CheckSquare className="w-6 h-6 text-emerald-400" />,
    overdue: <AlertTriangle className="w-6 h-6 text-rose-400" />,
    all: <CheckSquare className="w-6 h-6 text-indigo-400" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 animate-slide-up">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {icons[filter]}
            {filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks
          </h1>
          <p className="text-gray-500 text-sm">{filteredTasks.length} tasks across your projects</p>
        </div>
      </div>

      <div className="flex gap-2 bg-white/[0.02] p-1.5 rounded-xl inline-flex animate-slide-up border border-white/[0.04]" style={{ animationDelay: '0.05s' }}>
        {(['all', 'pending', 'completed', 'overdue'] as TaskFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass border border-white/[0.04] rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Task</th>
              <th className="text-left px-4 py-3">Project</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filteredTasks.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-600">No {filter} tasks found</td></tr>
            ) : (
              filteredTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <tr key={task.id} onClick={() => openProject(task.projectId)}
                    className="hover:bg-white/[0.02] cursor-pointer text-gray-400 transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">{task.title}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{project?.name || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'done' ? 'bg-emerald-500/15 text-emerald-400' :
                        task.status === 'review' ? 'bg-amber-500/15 text-amber-400' :
                        task.status === 'in-progress' ? 'bg-indigo-500/15 text-indigo-400' :
                        'bg-white/[0.04] text-gray-400'
                      }`}>{task.status.replace('-', ' ').toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isOverdue(task) ? 'text-rose-400 font-semibold' : ''}>{task.dueDate || '—'}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
