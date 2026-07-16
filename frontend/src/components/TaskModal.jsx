import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const emptyForm = {
  title: '',
  phase: 'Pre Release Campaign',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
  details: '',
  assignedTo: ''
};

const TaskModal = ({ isOpen, onClose, onSave, mode = 'create', initialData = null, teamMembers = [] }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [isOngoing, setIsOngoing] = useState(false);
  const { projectId } = useParams();
  const [roughIdea, setRoughIdea] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialData && initialData._id) {
      const assignedId = typeof initialData.assignedTo === 'object' && initialData.assignedTo !== null
        ? initialData.assignedTo._id
        : (initialData.assignedTo || '');
      setFormData({
        title: initialData.title || '',
        phase: initialData.phase || 'Pre Release Campaign',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
        dueDate: initialData.dueDate || '',
        details: initialData.details || '',
        assignedTo: assignedId
      });
      setIsOngoing(!initialData.dueDate);
    } else if (mode === 'create' && initialData && initialData.dueDate) {
      setFormData({ ...emptyForm, dueDate: initialData.dueDate });
      setIsOngoing(false);
    } else {
      setFormData(emptyForm);
      setIsOngoing(false);
    }
    setRoughIdea('');
    setGenerateError('');
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!roughIdea.trim()) {
      setGenerateError('Type a rough idea first');
      return;
    }
    setGenerateError('');
    setGenerating(true);
    try {
      const res = await api.post(`/projects/${projectId}/ai/generate-task-details`, { roughIdea });
      setFormData((prev) => ({
        ...prev,
        title: res.data.title,
        details: res.data.details,
        phase: res.data.phase,
        priority: res.data.priority
      }));
    } catch (error) {
      setGenerateError(error.response?.data?.message || 'Failed to generate. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      dueDate: isOngoing ? null : (formData.dueDate || null),
      assignedTo: formData.assignedTo || null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <Card className="p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold font-outfit mb-6">
            {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
          </h2>

          <div className="mb-5 p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-500/20 rounded-lg space-y-2">
            <label className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quick-fill with AI
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. post about trailer reactions"
                className="flex-1 bg-white dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={roughIdea}
                onChange={(e) => setRoughIdea(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerate(); } }}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="shrink-0 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
              </button>
            </div>
            {generateError && <p className="text-xs text-red-500">{generateError}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Task Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Social Media Poster Design"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Phase</label>
                <select 
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  value={formData.phase}
                  onChange={(e) => setFormData({...formData, phase: e.target.value})}
                >
                  <option>Trailer Drop Day</option>
                  <option>Trailer Release</option>
                  <option>Pre Release Campaign</option>
                  <option>Cinema Launch</option>
                  <option>Post Release</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                <select 
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            {mode === 'edit' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Assign To</label>
              <select
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase">Due Date</label>
                <label className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={isOngoing}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsOngoing(checked);
                      if (checked) {
                        setFormData({ ...formData, dueDate: '' });
                      }
                    }}
                    className="rounded border-border text-red-600 focus:ring-red-600/20"
                  />
                  <span>Ongoing / Continuing</span>
                </label>
              </div>
              <input 
                required={!isOngoing}
                disabled={isOngoing}
                type="date" 
                className={`w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none ${isOngoing ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Details (Optional)</label>
              <textarea 
                rows="3"
                placeholder="Task description..."
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                {mode === 'edit' ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TaskModal;