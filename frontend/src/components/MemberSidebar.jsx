import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Calendar as CalendarIcon, Layers, Settings, LogOut, Film, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MemberSidebar = ({ isMobileOpen, onClose }) => {
  const { projectId } = useParams();
  const { logout } = useAuth();
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProjectName(res.data.name);
      } catch (error) {
        console.error('Failed to load project name', error);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const navItems = [
    { name: 'Dashboard', path: `/project/${projectId}/member`, icon: LayoutDashboard, end: true },
    { name: 'My Tasks', path: `/project/${projectId}/member/my-tasks`, icon: CheckSquare },
    { name: 'Team Tasks', path: `/project/${projectId}/member/team-tasks`, icon: Users },
    { name: 'Calendar', path: `/project/${projectId}/member/calendar`, icon: CalendarIcon },
    { name: 'Monthly Reviews', path: `/project/${projectId}/member/monthly-reviews`, icon: Layers },
    { name: 'Settings', path: `/project/${projectId}/member/settings`, icon: Settings },
  ];

  const SidebarContent = ({ showClose }) => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-outfit font-bold text-base leading-tight tracking-tight truncate" title={projectName}>
            {projectName || 'Loading...'}
          </span>
          <NavLink to="/projects" className="text-xs text-red-500 hover:underline mt-0.5" onClick={onClose}>Switch Project</NavLink>
        </div>
        {showClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={onClose}
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
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="w-64 h-[calc(100vh-2rem)] hidden md:flex flex-col border-r bg-card border-border sticky top-8 z-40">
        <SidebarContent showClose={false} />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-card border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
            <SidebarContent showClose={true} />
          </aside>
        </div>
      )}
    </>
  );
};

export default MemberSidebar;