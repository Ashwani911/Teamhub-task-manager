import React, { useState, useEffect } from 'react';
import { api, Task, Project, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Folder, CheckSquare, Clock, AlertTriangle, Users, ArrowRight, TrendingUp, Target } from 'lucide-react';
import { TaskFilter } from './GlobalTasks';

interface Props {
  goToProjects: () => void;
  goToTeam: () => void;
  openProject: (id: string) => void;
  goToTasks: (filter: TaskFilter) => void;
}

export const Dashboard: React.FC<Props> = ({ goToProjects, goToTeam, openProject, goToTasks }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getTasks(), api.getProjects(), api.getUsers()])
      .then(([t, p, u]) => { setTasks(t); setProjects(p); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalProjects = projects.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
  const myTasks = tasks.filter(t => t.assigneeId === user?.id && t.status !== 'done');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const high = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600/20 via-violet-600/15 to-indigo-600/5 border border-indigo-500/10 rounded-2xl p-6 animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-indigo-200/60 text-sm mt-1">Here's your workspace overview. Let's get things done.</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 bg-indigo-500/10 px-3 py-1.5 rounded-lg">
              <Target className="w-3.5 h-3.5" /> {completionRate}% completion rate
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 bg-indigo-500/10 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> {myTasks.length} tasks assigned
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.08s' }}>
        <StatCard icon={<Folder className="w-5 h-5" />} label="Projects" value={totalProjects} color="indigo" onClick={goToProjects} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={pendingTasks} color="amber" onClick={() => goToTasks('pending')} />
        <StatCard icon={<CheckSquare className="w-5 h-5" />} label="Completed" value={completedTasks} color="emerald" onClick={() => goToTasks('completed')} />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={overdueTasks.length} color="rose" onClick={() => goToTasks('overdue')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 glass border border-white/[0.04] rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Tasks</h2>
            <button onClick={() => goToTasks('all')} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              View All →
            </button>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-10">
              <CheckSquare className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myTasks.slice(0, 5).map(task => (
                <TaskRow key={task.id} task={task} onClick={() => openProject(task.projectId)} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Completion Ring */}
          <div className="glass border border-white/[0.04] rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.16s' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Task Completion</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${completionRate} 100`} className="transition-all duration-1000" />
                  <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  <span className="text-[10px] text-gray-500">Done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Bars */}
          <div className="glass border border-white/[0.04] rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Priority Breakdown</h2>
            <div className="space-y-3.5">
              <PriorityBar label="🔥 High" count={high} total={tasks.length} color="bg-rose-500" />
              <PriorityBar label="⚡ Medium" count={medium} total={tasks.length} color="bg-amber-500" />
              <PriorityBar label="🍃 Low" count={low} total={tasks.length} color="bg-emerald-500" />
            </div>
          </div>

          {/* Team */}
          <div className="glass border border-white/[0.04] rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.24s' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Team
              </h3>
              <button onClick={goToTeam} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Manage</button>
            </div>
            <div className="flex -space-x-2">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border-2 border-[#0f1120] tooltip-wrap" data-tip={u.name}>
                  {u.initials}
                </div>
              ))}
              {users.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-white/[0.04] text-gray-500 flex items-center justify-center text-[10px] font-medium border-2 border-[#0f1120]">
                  +{users.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: number; color: string; onClick?: () => void }) => {
  const styles: Record<string, { bg: string; border: string; text: string }> = {
    indigo:  { bg: 'bg-indigo-500/8',  border: 'border-indigo-500/15', text: 'text-indigo-400' },
    amber:   { bg: 'bg-amber-500/8',   border: 'border-amber-500/15',  text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15', text: 'text-emerald-400' },
    rose:    { bg: 'bg-rose-500/8',     border: 'border-rose-500/15',   text: 'text-rose-400' },
  };
  const s = styles[color];

  return (
    <div onClick={onClick}
      className={`glass border border-white/[0.04] rounded-2xl p-4 flex items-center gap-3.5 card-hover ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`p-2.5 rounded-xl ${s.bg} border ${s.border} ${s.text}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

const TaskRow = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const colors: Record<string, string> = { 'todo': 'bg-gray-500', 'in-progress': 'bg-indigo-500', 'review': 'bg-amber-500', 'done': 'bg-emerald-500' };
  const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div onClick={onClick}
      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] hover:-translate-y-0.5 cursor-pointer group transition-all duration-300 border border-transparent hover:border-indigo-500/10">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full ${colors[task.status]} flex-shrink-0`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white group-hover:text-indigo-300 truncate transition-colors">{task.title}</p>
          <p className={`text-xs ${isOverdue ? 'text-rose-400' : 'text-gray-500'}`}>{task.dueDate || 'No date'}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
    </div>
  );
};

const PriorityBar = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500 font-medium">{count}</span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
