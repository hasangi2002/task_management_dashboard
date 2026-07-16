import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, UserPlus, AlertTriangle, CheckCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { computeMemberNotifications, computeAdminOverdueNotifications, markAllRead } from '../utils/notificationUtils';

const NotificationBell = ({ mode }) => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchData = async () => {
    try {
      const requests = [api.get(`/projects/${projectId}/tasks`)];
      if (mode === 'admin') requests.push(api.get(`/projects/${projectId}/users`));
      const results = await Promise.all(requests);
      setTasks(results[0].data);
      if (mode === 'admin') setMembers(results[1].data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!user) return;
    const notifs = mode === 'admin'
      ? computeAdminOverdueNotifications(tasks, members, user.id)
      : computeMemberNotifications(tasks, user.id);
    setNotifications(notifs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, members, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = () => {
    markAllRead(user.id, notifications);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    markAllRead(user.id, [notif]);
    setNotifications(notifications.map(n => n.key === notif.key ? { ...n, read: true } : n));
    setIsOpen(false);
    if (mode === 'admin') {
      navigate(`/project/${projectId}/tasks`);
    } else {
      navigate(`/project/${projectId}/member/my-tasks`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold font-outfit">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">You're all caught up.</p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.key}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 last:border-0 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${!notif.read ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notif.type === 'overdue' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
                    {notif.type === 'overdue' ? <AlertTriangle className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs leading-snug ${!notif.read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{notif.task.phase}</p>
                  </div>
                  {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1.5"></span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;