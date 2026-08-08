import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Printer, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { api } from '../../lib/axios.js';
import { NotificationItem } from '../../types/index.js';
import { getSocket } from '../../lib/socket.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      const unread = (res.data.data.notifications || []).filter((n: NotificationItem) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const socket = getSocket();
      socket.on('job:status', () => {
        fetchNotifications();
      });
      return () => {
        socket.off('job:status');
      };
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      const unreadItems = notifications.filter((n) => !n.isRead);
      for (const item of unreadItems) {
        await api.patch(`/notifications/${item.id}/read`);
      }
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="glass-nav sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Printer className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            SRM<span className="gradient-text">PRINT</span>
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Student Portal
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) markAllRead();
              }}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl z-50 border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-semibold text-sm text-white">Notifications</h4>
                  <span className="text-xs text-indigo-400 font-medium">{notifications.length} Total</span>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition ${
                          n.isRead ? 'bg-slate-900/50 border-slate-800/50 text-slate-400' : 'bg-indigo-950/30 border-indigo-500/20 text-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-200 mb-1">{n.title}</p>
                        <p className="text-slate-400 leading-relaxed">{n.message}</p>
                        <span className="inline-block text-[10px] text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile info */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
              <p className="text-[11px] text-slate-400">{user.rollNumber || user.email}</p>
            </div>

            <button
              onClick={logout}
              title="Logout"
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
