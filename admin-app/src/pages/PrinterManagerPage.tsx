import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios.js';
import { Printer, PrinterStatus } from '../types/index.js';
import { Plus, Trash2, Check, X, Server, Power, MapPin } from 'lucide-react';

export const PrinterManagerPage: React.FC = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Adding Printer
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [supportsColor, setSupportsColor] = useState(false);
  const [supportsA3, setSupportsA3] = useState(false);
  const [supportsA4, setSupportsA4] = useState(true);
  const [supportsDuplex, setSupportsDuplex] = useState(true);

  const fetchPrinters = async () => {
    try {
      const res = await api.get('/admin/printers');
      setPrinters(res.data.data.printers || []);
    } catch (err) {
      console.error('Error fetching printers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleAddPrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/printers', {
        name,
        displayName,
        location,
        supportsColor,
        supportsA3,
        supportsA4,
        supportsDuplex,
      });
      setShowAddModal(false);
      setName('');
      setDisplayName('');
      setLocation('');
      fetchPrinters();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: PrinterStatus) => {
    try {
      await api.patch(`/admin/printers/${id}`, { status });
      fetchPrinters();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePrinter = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this printer?')) return;
    try {
      await api.delete(`/admin/printers/${id}`);
      fetchPrinters();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Printer Hardware Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Manage physical stationery printers, driver names & capabilities</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add New Printer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-500">Loading hardware inventory...</div>
        ) : printers.length === 0 ? (
          <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-slate-800">
            <Server className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white mb-1">No Printers Configured</p>
            <p className="text-xs text-slate-400">Click "Add New Printer" to register your hardware.</p>
          </div>
        ) : (
          printers.map((p) => (
            <div key={p.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{p.displayName}</h3>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">{p.name}</p>
                  {p.location && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-slate-500" /> {p.location}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value as PrinterStatus)}
                    className={`py-1 px-2.5 rounded-xl border text-[10px] font-bold focus:outline-none ${
                      p.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : p.status === 'BUSY'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    <option value="AVAILABLE" className="bg-slate-900 text-white">ONLINE (Available)</option>
                    <option value="BUSY" className="bg-slate-900 text-white">BUSY</option>
                    <option value="OFFLINE" className="bg-slate-900 text-white">OFFLINE</option>
                  </select>

                  <button
                    onClick={() => handleDeletePrinter(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Capabilities Chips */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[10px] font-semibold text-slate-400 mb-2 uppercase">Hardware Features</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${p.supportsColor ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500 line-through'}`}>
                    Color
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${p.supportsA3 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500 line-through'}`}>
                    A3
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${p.supportsA4 ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'}`}>
                    A4
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${p.supportsDuplex ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>
                    Duplex
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Printer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-400" /> Add New OS Printer
            </h3>

            <form onSubmit={handleAddPrinter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Main Counter Heavy Duty Mono #1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OS Driver Printer Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="HP_LaserJet_Pro_M404_Mono"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Stationery Desk Counter 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-300 mb-1">Hardware Capabilities</p>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsColor}
                    onChange={(e) => setSupportsColor(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  Supports Full Color Printing
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsA3}
                    onChange={(e) => setSupportsA3(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  Supports A3 Paper Size
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsDuplex}
                    onChange={(e) => setSupportsDuplex(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  Supports Automatic Duplex (Double-Sided)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
                >
                  Save Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
