import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { TeamManagement } from './components/TeamManagement';
import { GlobalTasks, TaskFilter } from './components/GlobalTasks';
import { EditProfileModal } from './components/EditProfileModal';
import { Layers, Folder, Users, LogOut, CheckSquare, Pencil, LayoutDashboard } from 'lucide-react';

type View = 'dashboard' | 'projects' | 'project-detail' | 'team' | 'tasks';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!user) return <Login />;

  const openProject = (id: string) => { setSelectedProject(id); setView('project-detail'); };
  const goToTasks = (filter: TaskFilter) => { setTaskFilter(filter); setView('tasks'); };

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as View, label: 'Projects', icon: Folder },
    { id: 'tasks' as View, label: 'Tasks', icon: CheckSquare },
    { id: 'team' as View, label: 'Team', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0c0e1a] flex">
      {/* ====== Sidebar ====== */}
      <aside className="w-64 bg-[#0f1120] border-r border-white/[0.04] hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Team<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Hub</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = view === item.id || (item.id === 'projects' && view === 'project-detail');
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-500/15'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowEditProfile(true)} className="flex items-center gap-3 group flex-1 text-left" title="Edit Profile">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold group-hover:from-indigo-500/30 group-hover:to-violet-500/30 transition-all relative border border-indigo-500/10">
                {user.initials}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0f1120] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-2.5 h-2.5 text-indigo-400" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">{user.name}</p>
                <p className="text-[10px] text-indigo-400/70 uppercase tracking-wider font-semibold">{user.role}</p>
              </div>
            </button>
            <button onClick={logout} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors tooltip-wrap" data-tip="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ====== Mobile Header ====== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0f1120]/95 backdrop-blur-lg border-b border-white/[0.04] z-40">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-sm">Team<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`p-2 rounded-lg transition-all ${active ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
                  <Icon className="w-4.5 h-4.5" />
                </button>
              );
            })}
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ====== Main Content ====== */}
      <main className="flex-1 p-5 md:p-8 pt-18 md:pt-8 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && <Dashboard goToProjects={() => setView('projects')} goToTeam={() => setView('team')} openProject={openProject} goToTasks={goToTasks} />}
        {view === 'projects' && <ProjectList openProject={openProject} />}
        {view === 'tasks' && <GlobalTasks initialFilter={taskFilter} openProject={openProject} onBack={() => setView('dashboard')} />}
        {view === 'project-detail' && selectedProject && <ProjectDetail projectId={selectedProject} onBack={() => setView('projects')} />}
        {view === 'team' && <TeamManagement />}
      </main>

      {showEditProfile && user && (
        <EditProfileModal target={user} onClose={() => setShowEditProfile(false)} onSaved={() => {}} />
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <AuthProvider><AppContent /></AuthProvider>
);

export default App;
