import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { Sparkles, Heart } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-900/40 to-slate-900 border-b border-emerald-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-semibold text-white">Welcome to Smart Print Management System — Staff Control Panel</span>
            <span className="hidden md:inline-block text-slate-400">— Real-time queue control & hardware station monitor</span>
          </div>
        </div>

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer Team Credits */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          Developed with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline animate-bounce" /> by{' '}
          <strong className="text-slate-200">Tanishq, Tanmay, Vibhor & Shashwat</strong> for{' '}
          <span className="text-emerald-400 font-bold">SRMIST</span> —{' '}
          <span className="italic text-teal-400">Vibecoded to reality</span>
        </p>
      </footer>
    </div>
  );
};
