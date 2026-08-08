import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { PrintJob, JobStatus } from '../types/index.js';
import { getSocket } from '../lib/socket.js';
import { Clock, CheckCircle2, AlertTriangle, Printer, RefreshCw, XCircle } from 'lucide-react';

export const TrackJobPage: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();

    const socket = getSocket();
    socket.on('job:status', (data: { jobId: string; status: JobStatus; rejectionReason?: string }) => {
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.jobId === data.jobId
            ? { ...j, status: data.status, rejectionReason: data.rejectionReason }
            : j
        )
      );
    });

    return () => {
      socket.off('job:status');
    };
  }, []);

  const getStatusStep = (status: JobStatus): number => {
    switch (status) {
      case 'WAITING':
        return 1;
      case 'QUEUED':
        return 2;
      case 'PRINTING':
        return 3;
      case 'READY_TO_COLLECT':
      case 'COMPLETED':
        return 4;
      case 'REJECTED':
        return 0;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Live Job Queue Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status monitor powered by Socket.IO WebSocket</p>
        </div>
        <button
          onClick={fetchActiveJobs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading print queue...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800">
          <Clock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">No Active Print Jobs</p>
          <p className="text-xs text-slate-400">Submit a document to start tracking progress live.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => {
            const currentStep = getStatusStep(job.status);
            const isRejected = job.status === 'REJECTED';

            return (
              <div
                key={job.id}
                className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6 bg-slate-900/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs font-bold text-indigo-400">#{job.jobId}</span>
                      <span className="text-xs font-bold text-white truncate max-w-sm">{job.originalFilename}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {job.paperSize} • {job.colorMode === 'COLOR' ? 'Full Color' : 'B&W'} • {job.copies} copy(ies) • ₹{job.cost.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    {isRejected ? (
                      <span className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold inline-flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" /> Rejected
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold inline-flex items-center gap-1.5">
                        <Printer className="h-3.5 w-3.5" /> {job.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Steps Visual Bar */}
                {!isRejected ? (
                  <div className="relative">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-800">
                      <div
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 transition-all duration-700"
                      />
                    </div>
                    <div className="grid grid-cols-4 text-center">
                      {[
                        { label: 'Waiting', step: 1 },
                        { label: 'Queued', step: 2 },
                        { label: 'Printing', step: 3 },
                        { label: 'Ready to Collect', step: 4 },
                      ].map((s) => (
                        <div key={s.step} className="flex flex-col items-center">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition ${
                              currentStep >= s.step
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/50'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {currentStep > s.step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.step}
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              currentStep >= s.step ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Rejection Reason: {job.rejectionReason || 'Stationery staff cancelled this job.'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
