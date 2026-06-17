import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  CheckSquare, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Film
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Campaign Phases', path: '/phases', icon: Film },
  { name: 'KPI Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Team', path: '/team', icon: Users },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen hidden md:flex flex-col border-r bg-card border-border sticky top-0 transition-transform z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/20">
          M
        </div>
        <div className="flex flex-col">
          <span className="font-outfit font-bold text-lg leading-none tracking-tight">Mai Mara</span>
          <span className="text-xs text-muted-foreground uppercase opacity-70 tracking-widest text-[10px]">Prasangaya</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600/10 text-red-600 dark:text-red-500 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="glass-card p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-red-600 h-full"></div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">NEXT MILESTONE</span>
          <span className="font-outfit font-bold text-sm">Trailer Launch</span>
          <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
             14 Days Left
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;