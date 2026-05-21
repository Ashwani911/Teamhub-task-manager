import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Mail, User, ArrowRight, Shield, Zap, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        if (!name.trim()) throw new Error('Name is required');
        if (!password.trim()) throw new Error('Password is required');
        await signup(name, email, password, role);
      } else {
        if (!password.trim()) throw new Error('Password is required');
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail: string, pass: string) => {
    setEmail(demoEmail);
    setPassword(pass);
    setIsSignup(false);
    setError('');
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-scale-up relative z-10">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/[0.06]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30 animate-pulse-glow">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Team<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Collaborate · Track · Deliver
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-slide-up">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'member' as const, icon: Zap, label: 'Member', desc: 'View & update tasks', color: 'emerald' },
                    { key: 'admin' as const, icon: Shield, label: 'Admin', desc: 'Full control', color: 'indigo' },
                  ].map(r => (
                    <button key={r.key} type="button" onClick={() => setRole(r.key)}
                      className={`p-3 rounded-xl border text-center transition-all ${role === r.key
                        ? `bg-${r.color}-500/15 border-${r.color}-500/50 text-${r.color}-300 ring-1 ring-${r.color}-500/20`
                        : 'bg-white/[0.02] border-white/10 text-gray-500 hover:bg-white/[0.04]'
                      }`}>
                      <r.icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium block">{r.label}</span>
                      <span className="text-[10px] opacity-60">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 active:translate-y-0 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isSignup ? 'Create Account' : 'Sign In'}<ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Demo buttons */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-[10px] text-gray-500 text-center mb-3 uppercase tracking-widest font-semibold">Quick Demo</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quickLogin('ashwani@gmail.com', '123456789')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-400 hover:bg-indigo-600/15 hover:border-indigo-500/30 hover:text-indigo-300 hover:-translate-y-0.5 transition-all duration-300">
                <Shield className="w-3.5 h-3.5" /> Ashwani
              </button>
              <button onClick={() => quickLogin('alex@ethara.com', 'password123')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-gray-400 hover:bg-violet-600/15 hover:border-violet-500/30 hover:text-violet-300 hover:-translate-y-0.5 transition-all duration-300">
                <Zap className="w-3.5 h-3.5" /> Alex
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
