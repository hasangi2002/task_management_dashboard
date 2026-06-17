import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 transition-colors">
      
      <div className="flex items-center gap-2 max-w-md w-full relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search tasks, phases..." 
          className="w-full bg-slate-100 dark:bg-slate-900/50 border border-transparent focus:border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none transition-all placeholder:text-slate-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-card"></span>
        </button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e50914" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-border"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium leading-none">Admin</span>
            <span className="text-xs text-slate-500">Campaign Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
