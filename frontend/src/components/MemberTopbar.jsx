import React from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const MemberTopbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-8 z-30 flex items-center justify-between px-4 md:px-6 transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.jobRole || 'Team Member'}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <NotificationBell mode="member" />

        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <img
            src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Member')}&backgroundColor=e50914`}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-border"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Member')}&backgroundColor=e50914`; }}
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium leading-none">{user?.name}</span>
            <span className="text-xs text-slate-500">Team Member</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemberTopbar;