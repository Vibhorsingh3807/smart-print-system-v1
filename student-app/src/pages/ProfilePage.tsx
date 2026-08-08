import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, Mail, Hash, ShieldCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Student Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your campus account details</p>
      </div>

      <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-800">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-xl">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">{user.fullName}</h3>
            <p className="text-xs text-indigo-400 font-semibold">{user.role} ACCOUNT</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">College Email</p>
              <p className="text-xs font-bold text-white">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <Hash className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Registration / Roll Number</p>
              <p className="text-xs font-bold text-white">{user.rollNumber || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Account Status</p>
              <p className="text-xs font-bold text-emerald-400">Verified Active Student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
