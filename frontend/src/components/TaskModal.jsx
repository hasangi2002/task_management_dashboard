import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/Card';

const TaskModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    phase: 'Pre Release Campaign',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    details: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      title: '',
      phase: 'Pre Release Campaign',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
      details: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <Card className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold font-outfit mb-6">Create New Task</h2>
          
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Due Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                value={formData.dueDate}
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
                Create Task
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TaskModal;
