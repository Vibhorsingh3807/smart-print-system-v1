import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { AdminAnalytics, PrintJob } from '../types/index.js';
import { getAdminSocket } from '../lib/socket.js';
import { FileText, Clock, CheckCircle2, IndianRupee, Printer, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminAnalytics>({
    todayJobs: 0,
    pendingJobs: 0,
    completedToday: 0,
    revenueToday: 0,
  });
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/jobs?limit=5'),
      ]);
      setStats(analyticsRes.data.data);
      setRecentJobs(jobsRes.data.data.jobs || []);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = getAdminSocket();
    socket.on('job:new', () => fetchDashboardData());
    socket.on('job:updated', () => fetchDashboardData());

    return () => {
      socket.off('job:new');
      socket.off('job:updated');
    };
  }, []);

  const statCards = [
    { label: "Today's Total Jobs", value: stats.todayJobs, icon: FileText, color: 'from-blue-600 to-indigo-600' },
    { label: 'Pending in Queue', value: stats.pendingJobs, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'Completed Today', value: stats.completedToday, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: "Today's Revenue", value: `₹${stats.revenueToday.toFixed(2)}`, icon: IndianRupee, color: 'from-purple-600 to-pink-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Stationery Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Live operational statistics & print queue activity</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Queue Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="h-4 w-4 text-emerald-400" /> Recent Print Submissions
          </h3>
          <Link
            to="/queue"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            View Full Queue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Specs</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">Loading queue...</td>
                </tr>
              ) : recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">No print jobs in queue.</td>
                </tr>
              ) : (
                recentJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">#{j.jobId}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{j.user.fullName}</p>
                      <p className="text-[10px] text-slate-400">{j.user.rollNumber || j.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium truncate max-w-xs">{j.originalFilename}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {j.paperSize} • {j.colorMode} • {j.copies} copies
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
