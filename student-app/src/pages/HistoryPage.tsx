import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { PrintJob } from '../types/index.js';
import { History, Search, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/jobs/my-jobs');
        setJobs(res.data.data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredJobs = jobs.filter(
    (j) =>
      j.jobId.toLowerCase().includes(search.toLowerCase()) ||
      j.originalFilename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Print Job History</h1>
          <p className="text-xs text-slate-400 mt-1">Complete archive of all your past college print orders</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or filename..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading history...</td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">No print jobs found.</td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">#{j.jobId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-xs">{j.originalFilename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {j.paperSize} • {j.colorMode} • {j.copies} copy
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{j.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {j.status === 'COMPLETED' || j.status === 'READY_TO_COLLECT' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {j.status}
                        </span>
                      ) : j.status === 'REJECTED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-[10px] inline-flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-[10px]">
                          {j.status}
                        </span>
                      )}
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
