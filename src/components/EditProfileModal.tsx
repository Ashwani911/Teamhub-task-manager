import React, { useState } from 'react';
import { api, User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './ProjectList';
import { User as UserIcon, Mail, Lock, Save, CheckCircle } from 'lucide-react';

interface Props {
  target: User;
  onClose: () => void;
  onSaved: () => void;
}

export const EditProfileModal: React.FC<Props> = ({ target, onClose, onSaved }) => {
  const { user: currentUser, refreshUser } = useAuth();
  const isSelf = target.id === currentUser?.id;

  const [name, setName] = useState(target.name);
  const [email, setEmail] = useState(target.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validations
    if (!name.trim()) return setError('Name cannot be empty');
    if (!email.trim()) return setError('Email cannot be empty');

    setError('');
    setSaving(true);

    try {
      const updates: { name?: string; email?: string; password?: string } = {};

      if (name !== target.name) updates.name = name.trim();
      if (email !== target.email) updates.email = email.trim();
      if (password.trim()) updates.password = password.trim();

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      await api.updateUserProfile(target.id, updates, currentUser);

      // If editing self, refresh session
      if (isSelf) refreshUser();

      setSuccess('Profile updated successfully!');
      setPassword('');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="animate-scale-up">
        {/* Header with avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border transition-all duration-500 ${
            target.role === 'admin'
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
              : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || target.initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isSelf ? 'Edit Your Profile' : `Edit ${target.name}`}
            </h2>
            <p className="text-sm text-gray-400">
              {isSelf ? 'Update your name, email, or password' : 'Update this member\'s profile details'}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-slide-up">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-slide-up">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              New Password
              <span className="text-gray-500 font-normal ml-1">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl pl-10 pr-20 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-indigo-400 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gray-700/20 border border-gray-700/40 rounded-xl p-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Role: <span className={`font-semibold ${target.role === 'admin' ? 'text-indigo-400' : 'text-emerald-400'}`}>{target.role}</span></span>
              <span>ID: {target.id}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !!success}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};