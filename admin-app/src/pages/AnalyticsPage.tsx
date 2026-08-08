import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { AdminAnalytics } from '../types/index.js';
import { BarChart3, TrendingUp, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminAnalytics>({
    todayJobs: 0,
    pendingJobs: 0,
    completedToday: 0,
    revenueToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Print Analytics & Financial Summary</h1>
          <p className="text-xs text-slate-400 mt-1">Stationery counter metrics, job counts, and revenue tracking</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-400">Total Revenue Collected Today</h3>
          <p className="text-4xl font-black text-emerald-400">₹{stats.revenueToday.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Calculated from completed & ready to collect student orders</p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-400">Total Completed Print Jobs</h3>
          <p className="text-4xl font-black text-teal-400">{stats.completedToday}</p>
          <p className="text-xs text-slate-500">Successfully spooled and printed via Print Agent service</p>
        </div>
      </div>
    </div>
  );
};
