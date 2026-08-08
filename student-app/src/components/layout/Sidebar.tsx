import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, History, User } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'New Print Job', path: '/', icon: LayoutDashboard },
    { label: 'Track Jobs', path: '/track', icon: Clock },
    { label: 'Print History', path: '/history', icon: History },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 glass-card border-r border-slate-800 p-4 hidden md:block min-h-[calc(100vh-65px)]">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
