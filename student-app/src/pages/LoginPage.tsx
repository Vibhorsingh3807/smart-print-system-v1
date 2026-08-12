import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/axios.js';
import { Printer, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      if (user.role !== 'STUDENT') {
        setError('Please use the Admin Portal for staff login.');
        setLoading(false);
        return;
      }
      login(accessToken, refreshToken, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center shadow-xl shadow-indigo-500/20 mb-4">
            <Printer className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Login</h1>
          <p className="text-xs text-slate-400 mt-1">Smart College Print Management Portal</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@srmprint.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:from-indigo-500 hover:to-indigo-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-5">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Create Account
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-500 flex-wrap">
              <Link to="/privacy" className="hover:text-slate-300 transition">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-slate-300 transition">Terms</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-slate-300 transition">Refunds</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-slate-300 transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
