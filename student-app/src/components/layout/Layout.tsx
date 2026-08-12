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
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border-b border-indigo-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-semibold text-white">Welcome to Smart Print Management System</span>
            <span className="hidden md:inline-block text-slate-400">— Submit documents, estimate costs & track print jobs in real-time</span>
          </div>
        </div>

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer Team Credits & Policy Links */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            Developed with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 inline animate-bounce" /> by{' '}
            <strong className="text-slate-200">Tanishq, Tanmay, Vibhor & Shashwat</strong> for{' '}
            <span className="text-indigo-400 font-bold">SRMIST</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap justify-center">
            <a href="/privacy" className="hover:text-indigo-400 transition">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-indigo-400 transition">Terms of Service</a>
            <span>•</span>
            <a href="/refund-policy" className="hover:text-indigo-400 transition">Refund Policy</a>
            <span>•</span>
            <a href="/contact" className="hover:text-indigo-400 transition">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
