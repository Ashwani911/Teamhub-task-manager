import React, { useState, useEffect } from 'react';
import { api, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldCheck, Mail, UserPlus, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import { Modal } from './ProjectList';
import { EditProfileModal } from './EditProfileModal';

export const TeamManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add member modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'member' as 'admin' | 'member' });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Remove member modal
  const [showRemove, setShowRemove] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);

  // Role change modal
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');

  // Edit profile modal
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const loadUsers = async () => {
    const list = await api.getUsers();
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  // --- Add Member ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setAddError('All fields are required');
      return;
    }
    setAddError('');
    try {
      await api.createUser(addForm.name, addForm.email, addForm.role);
      setAddSuccess(`${addForm.name} has been added to the team!`);
      setAddForm({ name: '', email: '', role: 'member' });
      await loadUsers();
      setTimeout(() => setAddSuccess(''), 3000);
    } catch (err: any) {
      setAddError(err.message);
    }
  };

  // --- Remove Member ---
  const openRemoveModal = (u: User) => {
    setRemoveTarget(u);
    setShowRemove(true);
  };

  const handleRemove = async () => {
    if (!removeTarget || !currentUser) return;
    setRemoving(true);
    try {
      await api.deleteUser(removeTarget.id, currentUser);
      await loadUsers();
      setShowRemove(false);
      setRemoveTarget(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRemoving(false);
    }
  };

  // --- Change Role ---
  const openRoleModal = (u: User) => {
    setRoleTarget(u);
    setNewRole(u.role);
    setShowRoleChange(true);
  };

  const handleRoleChange = async () => {
    if (!roleTarget || !currentUser) return;
    try {
      await api.updateUserRole(roleTarget.id, newRole, currentUser);
      await loadUsers();
      setShowRoleChange(false);
      setRoleTarget(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400 text-sm">Manage team members and their roles</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowAdd(true); setAddError(''); setAddSuccess(''); }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Role Legend */}
      <div className="glass border border-white/[0.04] rounded-xl p-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-gray-300"><span className="font-medium text-white">Admin</span> — Full access, manage projects & team</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-gray-300"><span className="font-medium text-white">Member</span> — View and update assigned tasks</span>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {users.map(u => {
          const isSelf = u.id === currentUser?.id;

          return (
            <div key={u.id} className="glass border border-white/[0.04] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border ${
                  u.role === 'admin'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {u.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{u.name}</h3>
                    {isSelf && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-medium">You</span>}
                  </div>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {u.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Role Badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  u.role === 'admin'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {u.role === 'admin' ? 'Admin' : 'Member'}
                </span>

                {/* Edit Profile — self can always edit, admin can edit anyone */}
                {(isSelf || isAdmin) && (
                  <button
                    onClick={() => setEditTarget(u)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all border border-gray-600 hover:border-indigo-500 flex items-center gap-1.5"
                    title="Edit Profile"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}

                {/* Admin actions on other users */}
                {isAdmin && !isSelf && (
                  <>
                    {/* Change Role Button */}
                    <button
                      onClick={() => openRoleModal(u)}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-gray-600"
                    >
                      Change Role
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => openRemoveModal(u)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title={`Remove ${u.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state for non-admin */}
      {!isAdmin && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 text-center text-sm text-gray-500">
          Only admins can add, remove, or change roles of team members.
        </div>
      )}

      {/* ==================== */}
      {/* ADD MEMBER MODAL     */}
      {/* ==================== */}
      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); setAddError(''); setAddSuccess(''); }}>
          <h2 className="text-lg font-bold text-white mb-1">Add Team Member</h2>
          <p className="text-sm text-gray-400 mb-4">Create an account for a new team member.</p>

          {addError && (
            <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {addError}
            </div>
          )}
          {addSuccess && (
            <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
              {addSuccess}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g., John Doe"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={addForm.email}
                onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="john@company.com"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, role: 'member' })}
                  className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    addForm.role === 'member'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, role: 'admin' })}
                  className={`p-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    addForm.role === 'admin'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================== */}
      {/* REMOVE MEMBER MODAL     */}
      {/* ======================== */}
      {showRemove && removeTarget && (
        <Modal onClose={() => { setShowRemove(false); setRemoveTarget(null); }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500/10 rounded-2xl mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Remove Member</h2>
            <p className="text-sm text-gray-400 mb-1">
              Are you sure you want to remove
            </p>
            <p className="text-white font-semibold text-lg mb-1">{removeTarget.name}</p>
            <p className="text-xs text-gray-500 mb-6">
              ({removeTarget.email})
            </p>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 mb-6 text-left">
              <p className="text-xs text-red-300">This action will:</p>
              <ul className="text-xs text-red-300/80 mt-1 space-y-1 list-disc list-inside">
                <li>Remove the member from all projects</li>
                <li>Unassign their tasks</li>
                <li>Delete their account</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowRemove(false); setRemoveTarget(null); }}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================== */}
      {/* CHANGE ROLE MODAL       */}
      {/* ======================== */}
      {showRoleChange && roleTarget && (
        <Modal onClose={() => { setShowRoleChange(false); setRoleTarget(null); }}>
          <h2 className="text-lg font-bold text-white mb-1">Change Role</h2>
          <p className="text-sm text-gray-400 mb-5">
            Update the role for <span className="text-white font-medium">{roleTarget.name}</span>
          </p>

          {/* Current Role */}
          <div className="mb-4 p-3 bg-gray-700/30 rounded-xl border border-gray-700/50">
            <p className="text-xs text-gray-500 mb-1">Current Role</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              roleTarget.role === 'admin'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {roleTarget.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {roleTarget.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>

          {/* New Role Selection */}
          <p className="text-xs text-gray-500 mb-2">Select New Role</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setNewRole('member')}
              className={`p-4 rounded-xl border transition-all text-left ${
                newRole === 'member'
                  ? 'bg-emerald-600/15 border-emerald-500 ring-1 ring-emerald-500/30'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 mb-2 ${newRole === 'member' ? 'text-emerald-400' : 'text-gray-500'}`} />
              <p className={`text-sm font-semibold ${newRole === 'member' ? 'text-emerald-300' : 'text-gray-400'}`}>Member</p>
              <p className="text-[11px] text-gray-500 mt-0.5">View & update tasks</p>
            </button>
            <button
              onClick={() => setNewRole('admin')}
              className={`p-4 rounded-xl border transition-all text-left ${
                newRole === 'admin'
                  ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30'
                  : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
              }`}
            >
              <Shield className={`w-5 h-5 mb-2 ${newRole === 'admin' ? 'text-indigo-400' : 'text-gray-500'}`} />
              <p className={`text-sm font-semibold ${newRole === 'admin' ? 'text-indigo-300' : 'text-gray-400'}`}>Admin</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Full access & control</p>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowRoleChange(false); setRoleTarget(null); }}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              disabled={newRole === roleTarget.role}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              {newRole === roleTarget.role ? 'No Change' : 'Update Role'}
            </button>
          </div>
        </Modal>
      )}

      {/* ======================== */}
      {/* EDIT PROFILE MODAL      */}
      {/* ======================== */}
      {editTarget && (
        <EditProfileModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadUsers}
        />
      )}
    </div>
  );
};