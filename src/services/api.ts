// ============================================
// ETHARA API Service
// ============================================
//
// TWO MODES:
//   1. HttpApi  — talks to the real Express backend (when VITE_API_URL is set)
//   2. LocalApi — uses localStorage for offline preview / demo
//
// The correct one is auto-selected at the bottom of this file.
// Components just import `api` and call methods — zero changes needed.
// ============================================

// ---------- Shared Interfaces ----------

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'member';
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  dueDate: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

// ============================================
// 1. HTTP API — Real backend calls
// ============================================

class HttpApi {
  private baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  // -- internal helper: make an authenticated JSON request --
  private async request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('ts_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...opts,
      headers: { ...headers, ...(opts.headers as Record<string, string> || {}) },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Request failed (${res.status})`);
    }

    return res.json();
  }

  // ---- Auth ----

  async login(email: string, password?: string): Promise<User> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('ts_token', data.token);
    localStorage.setItem('ts_session', JSON.stringify(data.user));
    return data.user;
  }

  async signup(name: string, email: string, role: 'admin' | 'member' = 'member', password?: string): Promise<User> {
    const data = await this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: password || '123456789', role }),
    });
    localStorage.setItem('ts_token', data.token);
    localStorage.setItem('ts_session', JSON.stringify(data.user));
    return data.user;
  }

  async createUser(name: string, email: string, role: 'admin' | 'member'): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, role, password: '123456789' }),
    });
  }

  logout() {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_session');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('ts_token');
    if (!token) return null;
    try {
      const user = await this.request<User>('/auth/me');
      localStorage.setItem('ts_session', JSON.stringify(user));
      return user;
    } catch {
      this.logout();
      return null;
    }
  }

  // ---- Users ----

  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async updateUserRole(userId: string, role: 'admin' | 'member', _actor: User): Promise<void> {
    await this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserProfile(userId: string, updates: { name?: string; email?: string; password?: string }, _actor: User): Promise<User> {
    const user = await this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    // If editing self, refresh session
    const session = JSON.parse(localStorage.getItem('ts_session') || '{}');
    if (session.id === userId) {
      localStorage.setItem('ts_session', JSON.stringify(user));
    }
    return user;
  }

  async deleteUser(userId: string, _actor: User): Promise<void> {
    await this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  // ---- Projects ----

  async getProjects(): Promise<Project[]> {
    return this.request('/projects');
  }

  async createProject(name: string, description: string, _actor: User): Promise<Project> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteProject(projectId: string, _actor: User): Promise<void> {
    await this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  async updateProjectMembers(projectId: string, userId: string, add: boolean, _actor: User): Promise<Project> {
    return this.request(`/projects/${projectId}/members`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, action: add ? 'add' : 'remove' }),
    });
  }

  // ---- Tasks ----

  async getTasks(projectId?: string): Promise<Task[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request(`/tasks${query}`);
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return this.request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // ---- Comments ----

  async getComments(taskId: string): Promise<Comment[]> {
    return this.request(`/comments?taskId=${taskId}`);
  }

  async addComment(taskId: string, text: string, _user: User): Promise<Comment> {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({ taskId, text }),
    });
  }
}

// ============================================
// 2. Local API — localStorage mock (for preview)
// ============================================

const uid = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_USERS: User[] = [
  { id: 'u0', name: 'Ashwani', email: 'ashwani@gmail.com', password: '123456789', role: 'admin', initials: 'AS' },
  { id: 'u1', name: 'Sarah Jenkins', email: 'admin@ethara.com', password: 'password123', role: 'admin', initials: 'SJ' },
  { id: 'u2', name: 'Alex Rivera', email: 'alex@ethara.com', password: 'password123', role: 'member', initials: 'AR' },
  { id: 'u3', name: 'Chloe Chen', email: 'chloe@ethara.com', password: 'password123', role: 'member', initials: 'CC' },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', description: 'Modernize the landing page and dashboard interface for better UX.', ownerId: 'u1', members: ['u0', 'u1', 'u2', 'u3'], createdAt: '2026-01-15' },
  { id: 'p2', name: 'Mobile App Launch', description: 'Prepare marketing materials and beta testing for iOS/Android launch.', ownerId: 'u1', members: ['u0', 'u1', 'u2'], createdAt: '2026-01-20' },
];

const DEFAULT_TASKS: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Design Dark Mode Support', description: 'Create color palettes and test UI for accessibility compliance.', status: 'in-progress', priority: 'high', assigneeId: 'u2', dueDate: '2026-02-15', checklist: [{ id: 'c1', text: 'Pick primary/secondary colors', done: true }, { id: 'c2', text: 'Contrast check for text', done: false }], createdAt: '2026-01-16' },
  { id: 't2', projectId: 'p1', title: 'Fix Navigation Errors', description: 'Resolve client/server state mismatch in navigation drawer.', status: 'todo', priority: 'medium', assigneeId: 'u3', dueDate: '2026-02-10', checklist: [], createdAt: '2026-01-17' },
  { id: 't3', projectId: 'p1', title: 'Audit API Caching', description: 'Verify cache invalidation for the main data fetch routes.', status: 'done', priority: 'low', assigneeId: 'u1', dueDate: '2026-01-25', checklist: [], createdAt: '2026-01-15' },
  { id: 't4', projectId: 'p2', title: 'App Store Materials', description: 'Gather screenshots, release notes, and store configuration details.', status: 'todo', priority: 'high', assigneeId: 'u2', dueDate: '2026-02-20', checklist: [], createdAt: '2026-01-19' },
];

const DEFAULT_COMMENTS: Comment[] = [
  { id: 'cm1', taskId: 't1', userId: 'u1', userName: 'Sarah Jenkins', text: 'Please make sure contrast levels meet WCAG AA standards.', createdAt: '2026-01-17T10:00:00' },
];

function getStore<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(`ts_${key}`);
  if (!raw) { localStorage.setItem(`ts_${key}`, JSON.stringify(fallback)); return fallback; }
  return JSON.parse(raw);
}
function setStore<T>(key: string, value: T) { localStorage.setItem(`ts_${key}`, JSON.stringify(value)); }

class LocalApi {
  // ---- Auth ----
  async login(email: string, password?: string): Promise<User> {
    const users = getStore('users', DEFAULT_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Try: ashwani@gmail.com or admin@teamhub.com');
    if (password && user.password && user.password !== password) throw new Error('Incorrect password');
    const s = { ...user }; delete s.password;
    localStorage.setItem('ts_session', JSON.stringify(s));
    return s;
  }

  async signup(name: string, email: string, role: 'admin' | 'member' = 'member', password?: string): Promise<User> {
    const users = getStore('users', DEFAULT_USERS);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already exists');
    const newUser: User = { id: `u${uid()}`, name, email, password: password || '123456789', role, initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) };
    users.push(newUser);
    setStore('users', users);
    const s = { ...newUser }; delete s.password;
    localStorage.setItem('ts_session', JSON.stringify(s));
    return s;
  }

  async createUser(name: string, email: string, role: 'admin' | 'member'): Promise<User> {
    const users = getStore('users', DEFAULT_USERS);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already exists');
    const newUser: User = { id: `u${uid()}`, name, email, role, initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) };
    users.push(newUser);
    setStore('users', users);
    return newUser;
  }

  logout() { localStorage.removeItem('ts_session'); }

  async getCurrentUser(): Promise<User | null> {
    const raw = localStorage.getItem('ts_session');
    return raw ? JSON.parse(raw) : null;
  }

  // ---- Users ----
  async getUsers(): Promise<User[]> { return getStore('users', DEFAULT_USERS); }

  async updateUserRole(userId: string, role: 'admin' | 'member', actor: User): Promise<void> {
    if (actor.role !== 'admin') throw new Error('Only admins can change roles');
    const users = getStore('users', DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    users[idx].role = role;
    setStore('users', users);
  }

  async updateUserProfile(userId: string, updates: { name?: string; email?: string; password?: string }, actor: User): Promise<User> {
    if (userId !== actor.id && actor.role !== 'admin') throw new Error('Only admins can edit other profiles');
    const users = getStore('users', DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    if (updates.email && updates.email.toLowerCase() !== users[idx].email.toLowerCase()) {
      if (users.find(u => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase())) throw new Error('Email already in use');
    }
    if (updates.name) { users[idx].name = updates.name; users[idx].initials = updates.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
    if (updates.email) users[idx].email = updates.email;
    if (updates.password) users[idx].password = updates.password;
    setStore('users', users);
    if (userId === actor.id) { const s = { ...users[idx] }; delete s.password; localStorage.setItem('ts_session', JSON.stringify(s)); }
    const r = { ...users[idx] }; delete r.password; return r;
  }

  async deleteUser(userId: string, actor: User): Promise<void> {
    if (actor.role !== 'admin') throw new Error('Only admins can remove members');
    if (userId === actor.id) throw new Error('You cannot remove yourself');
    const users = getStore('users', DEFAULT_USERS);
    setStore('users', users.filter(u => u.id !== userId));
    const projects = getStore('projects', DEFAULT_PROJECTS);
    projects.forEach(p => { p.members = p.members.filter(id => id !== userId); });
    setStore('projects', projects);
    const tasks = getStore('tasks', DEFAULT_TASKS);
    tasks.forEach(t => { if (t.assigneeId === userId) t.assigneeId = ''; });
    setStore('tasks', tasks);
  }

  // ---- Projects ----
  async getProjects(): Promise<Project[]> { return getStore('projects', DEFAULT_PROJECTS); }

  async createProject(name: string, description: string, actor: User): Promise<Project> {
    if (actor.role !== 'admin') throw new Error('Only admins can create projects');
    const projects = getStore('projects', DEFAULT_PROJECTS);
    const p: Project = { id: `p${uid()}`, name, description, ownerId: actor.id, members: [actor.id], createdAt: new Date().toISOString().split('T')[0] };
    projects.push(p); setStore('projects', projects); return p;
  }

  async deleteProject(projectId: string, actor: User): Promise<void> {
    if (actor.role !== 'admin') throw new Error('Only admins can delete projects');
    setStore('projects', getStore('projects', DEFAULT_PROJECTS).filter((p: Project) => p.id !== projectId));
    setStore('tasks', getStore('tasks', DEFAULT_TASKS).filter((t: Task) => t.projectId !== projectId));
  }

  async updateProjectMembers(projectId: string, userId: string, add: boolean, actor: User): Promise<Project> {
    if (actor.role !== 'admin') throw new Error('Only admins can manage members');
    const projects = getStore('projects', DEFAULT_PROJECTS);
    const project = projects.find((p: Project) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    if (add && !project.members.includes(userId)) project.members.push(userId);
    else if (!add) project.members = project.members.filter((id: string) => id !== userId);
    setStore('projects', projects); return project;
  }

  // ---- Tasks ----
  async getTasks(projectId?: string): Promise<Task[]> {
    const tasks = getStore('tasks', DEFAULT_TASKS);
    return projectId ? tasks.filter((t: Task) => t.projectId === projectId) : tasks;
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const tasks = getStore('tasks', DEFAULT_TASKS);
    const t: Task = { ...data, id: `t${uid()}`, createdAt: new Date().toISOString() };
    tasks.push(t); setStore('tasks', tasks); return t;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const tasks = getStore('tasks', DEFAULT_TASKS);
    const idx = tasks.findIndex((t: Task) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...updates };
    setStore('tasks', tasks); return tasks[idx];
  }

  async deleteTask(taskId: string): Promise<void> {
    setStore('tasks', getStore('tasks', DEFAULT_TASKS).filter((t: Task) => t.id !== taskId));
    setStore('comments', getStore('comments', DEFAULT_COMMENTS).filter((c: Comment) => c.taskId !== taskId));
  }

  // ---- Comments ----
  async getComments(taskId: string): Promise<Comment[]> {
    return getStore('comments', DEFAULT_COMMENTS)
      .filter((c: Comment) => c.taskId === taskId)
      .sort((a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addComment(taskId: string, text: string, user: User): Promise<Comment> {
    const comments = getStore('comments', DEFAULT_COMMENTS);
    const c: Comment = { id: `cm${uid()}`, taskId, userId: user.id, userName: user.name, text, createdAt: new Date().toISOString() };
    comments.push(c); setStore('comments', comments); return c;
  }
}

// ============================================
// Auto-select: use real backend if VITE_API_URL is set,
// otherwise fall back to localStorage demo.
// ============================================
const API_URL = (import.meta as any).env?.VITE_API_URL || '';
export const api = API_URL ? new HttpApi(API_URL) : new LocalApi();
