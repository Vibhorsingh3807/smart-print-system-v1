import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { PrintJob, JobStatus } from '../types/index.js';
import { getAdminSocket } from '../lib/socket.js';
import { Search, Play, CheckCircle, XCircle, Trash2, FileText, Printer, AlertTriangle, Bell, Power, RefreshCw, CreditCard, Banknote } from 'lucide-react';

export const QueueManagerPage: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Station readiness state: READY -> NOT_READY -> COMPLETED -> READY
  const [stationState, setStationState] = useState<'READY' | 'NOT_READY' | 'COMPLETED'>('READY');

  // Interactive Pop-up Toast notification state (persistent for Cash orders)
  const [activeToastJob, setActiveToastJob] = useState<PrintJob | null>(null);

  // Modal State for Rejecting Job
  const [rejectModalJobId, setRejectModalJobId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await api.get('/admin/jobs?limit=100');
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Error fetching print queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const socket = getAdminSocket();
    socket.on('job:new', (job: PrintJob) => {
      fetchQueue();
      // Show Pop-Up Notification when new job is received
      setActiveToastJob(job);
    });

    socket.on('job:updated', () => fetchQueue());
    socket.on('job:deleted', () => fetchQueue());

    return () => {
      socket.off('job:new');
      socket.off('job:updated');
      socket.off('job:deleted');
    };
  }, []);

  const toggleStationState = () => {
    if (stationState === 'READY') {
      setStationState('NOT_READY');
    } else if (stationState === 'NOT_READY') {
      setStationState('COMPLETED');
    } else {
      setStationState('READY');
    }
  };

  const handleUpdateStatus = async (id: string, status: JobStatus, reason?: string) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status, rejectionReason: reason });
      fetchQueue();
      if (activeToastJob && activeToastJob.id === id) {
        setActiveToastJob(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job record?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.jobId.toLowerCase().includes(search.toLowerCase()) ||
      j.originalFilename.toLowerCase().includes(search.toLowerCase()) ||
      j.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (j.user.rollNumber && j.user.rollNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 relative">
      {/* Interactive Pop-up Toast Notification */}
      {activeToastJob && (
        <div className="fixed top-20 right-6 z-50 glass-card p-5 rounded-3xl border-2 border-emerald-500 bg-slate-900 shadow-2xl animate-bounce space-y-3 max-w-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">🔔 New Print Job Received!</h4>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">Order #{activeToastJob.jobId}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveToastJob(null)}
              className="text-slate-500 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-white truncate">{activeToastJob.originalFilename}</p>
            <p className="text-[11px] text-slate-400">By: {activeToastJob.user?.fullName}</p>
            <p className="text-[11px] font-bold text-emerald-400">Cost: ₹{activeToastJob.cost.toFixed(2)}</p>
            <div className="flex items-center gap-2 pt-1">
              {activeToastJob.paymentMethod === 'ONLINE' ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Prepaid Online
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <Banknote className="h-3 w-3" /> Cash Pending
                </span>
              )}
            </div>
          </div>

          {/* Action buttons inside Notification Toast */}
          {activeToastJob.status === 'WAITING' || activeToastJob.paymentMethod === 'CASH' ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleUpdateStatus(activeToastJob.id, 'QUEUED')}
                className="py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:bg-emerald-500 flex items-center justify-center gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Accept Cash
              </button>
              <button
                onClick={() => handleUpdateStatus(activeToastJob.id, 'REJECTED', 'Declined by counter staff')}
                className="py-2 px-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-600 hover:text-white flex items-center justify-center gap-1"
              >
                <XCircle className="h-3.5 w-3.5" /> Decline
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveToastJob(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Header & Station Toggle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Queue Management</h1>
          <p className="text-xs text-slate-400 mt-1">Live real-time control over all incoming campus print jobs</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleStationState}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-extrabold flex items-center gap-2 transition shadow-lg ${
              stationState === 'READY'
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                : stationState === 'NOT_READY'
                ? 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white'
                : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>Station Mode: <strong>{stationState.replace('_', ' ')}</strong></span>
            <RefreshCw className="h-3 w-3 opacity-60 ml-1" />
          </button>

          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, roll no, order #..."
              className="w-full sm:w-56 pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'WAITING', 'QUEUED', 'PRINTING', 'READY_TO_COLLECT', 'COMPLETED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`py-2 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Queue Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Student Info</th>
                <th className="px-5 py-4">Document</th>
                <th className="px-5 py-4">Options</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Cost</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">Loading live queue...</td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">No print jobs found.</td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-4 font-mono font-black text-emerald-400">#{job.jobId}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{job.user.fullName}</p>
                      <p className="text-[10px] text-slate-400">{job.user.rollNumber || job.user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-xs">{job.originalFilename}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {job.paperSize} • {job.colorMode} • {job.copies} copy
                    </td>
                    <td className="px-5 py-4">
                      {job.paymentMethod === 'ONLINE' || job.isPaid ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> Prepaid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                          <Banknote className="h-3 w-3" /> Cash Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">₹{job.cost.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                          job.status === 'COMPLETED' || job.status === 'READY_TO_COLLECT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : job.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : job.status === 'WAITING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      {/* Cash Accept Action Button */}
                      {job.status === 'WAITING' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'QUEUED')}
                          title="Accept Cash & Send to Printer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:bg-emerald-500 transition inline-flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Accept Cash
                        </button>
                      )}

                      {job.status === 'QUEUED' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'PRINTING')}
                          title="Start Printing"
                          className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {job.status === 'PRINTING' && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'READY_TO_COLLECT')}
                          title="Mark Ready for Collection"
                          className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {job.status !== 'COMPLETED' && job.status !== 'REJECTED' && (
                        <button
                          onClick={() => {
                            setRejectModalJobId(job.id);
                            setRejectReason('');
                          }}
                          title="Reject / Decline Job"
                          className="p-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete Record"
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalJobId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Reject / Decline Print Job
            </h3>
            <p className="text-xs text-slate-400">Specify reason for rejecting this student job:</p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unpaid cash order, invalid document format, unreadable pages..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalJobId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(rejectModalJobId, 'REJECTED', rejectReason || 'Declined by counter staff');
                  setRejectModalJobId(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
