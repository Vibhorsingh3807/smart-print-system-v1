import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { ShieldCheck, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-nav sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            PRINT<span className="gradient-text-admin">HELPER ADMIN</span>
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Staff Control Panel
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
              <p className="text-[11px] text-emerald-400 font-medium">{user.email}</p>
            </div>

            <button
              onClick={logout}
              title="Logout Staff"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
