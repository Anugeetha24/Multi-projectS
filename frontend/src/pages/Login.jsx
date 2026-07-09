import { useState } from 'react';
import { Award, Mail, Lock, User, Briefcase, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export default function Login({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let data;
      if (isRegister) {
        console.log('[Auth] Attempting self student registration...');
        data = await api.register(name, email, password, targetRole);
      } else {
        console.log('[Auth] Attempting student credentials authentication...');
        data = await api.login(email, password);
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('student', JSON.stringify(data.student));
      onAuthSuccess(data.student);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#070b13]">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-650/10 rounded-full blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-md glass rounded-3xl p-8 border border-slate-800 relative z-10 space-y-6">
        
        {/* Logo Hub */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Award className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Placement Prep Agent
          </h1>
          <p className="text-xs text-slate-400">
            Multi-Agent Smart Placement Evaluation Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-200"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-200"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-202"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Role</label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 text-sm rounded-xl focus:outline-none appearance-none"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="System Architect">System Architect</option>
                </select>
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Student Profile' : 'Sign In Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an acount? Register"}
          </button>
        </div>

      </div>
    </div>
  );
}
