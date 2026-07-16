import React from 'react';
import { Search, Moon, Sun, X, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Topbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { searchTerm, setSearchTerm } = useSearch();
  const { user } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value && !location.pathname.endsWith('/tasks')) {
      navigate(`/project/${projectId}/tasks`);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-8 z-30 flex items-center justify-between px-4 md:px-6 transition-colors gap-3">
      
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 max-w-md w-full relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search tasks, phases..." 
          className="w-full bg-slate-100 dark:bg-slate-900/50 border border-transparent focus:border-border rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none transition-all placeholder:text-slate-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <NotificationBell mode="admin" />

        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Admin')}&backgroundColor=e50914`}
            alt="User" 
            className="w-8 h-8 rounded-full border border-border"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium leading-none">{user?.name}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;