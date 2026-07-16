import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CompanyBar from '../components/CompanyBar';
import { Film, Plus, Loader2, LogOut, X, Sparkles } from 'lucide-react';

const ProjectSelect = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/projects', { name: newProjectName });
      setProjects([res.data, ...projects]);
      setIsCreating(false);
      setNewProjectName('');
    } catch (error) {
      alert('Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectProject = (project) => {
    if (user.role === 'admin') {
      navigate(`/project/${project._id}`);
    } else {
      navigate(`/project/${project._id}/member`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CompanyBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CompanyBar />

      <header className="border-b border-border bg-card/60">
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CrestPointMedia</p>
              <h1 className="text-lg font-bold font-outfit leading-tight">Campaign Dashboard</h1>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-outfit">{getGreeting()}, {user.name.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {user.role === 'admin' ? 'Choose a project to manage.' : 'Choose a project to view your tasks.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => handleSelectProject(project)}
                className="text-left bg-card border border-border rounded-xl p-5 hover:border-red-500/50 hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold font-outfit text-slate-800 dark:text-slate-100 truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </button>
            ))}

            {user.role === 'admin' && (
              <button
                onClick={() => setIsCreating(true)}
                className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-red-600 hover:border-red-500/50 transition-all min-h-[92px]"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">New Project</span>
              </button>
            )}
          </div>

          {projects.length === 0 && user.role === 'member' && (
            <p className="text-sm text-slate-500 text-center mt-10">
              You haven't been added to a project yet. Contact your admin.
            </p>
          )}
        </div>
      </main>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 relative">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold font-outfit mb-4">New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                placeholder="e.g. Sinhala Film Two — Social Campaign"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelect;