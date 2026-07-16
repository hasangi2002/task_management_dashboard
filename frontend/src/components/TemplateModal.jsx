import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/Card';

const PHASES = ['Trailer Drop Day', 'Trailer Release', 'Pre Release Campaign', 'Cinema Launch', 'Post Release'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const emptyForm = {
  title: '',
  phase: 'Pre Release Campaign',
  priority: 'Medium',
  role: '',
  details: '',
  dayOfMonth: ''
};

const TemplateModal = ({ isOpen, onClose, onSave, mode = 'create', initialData = null, roles = [] }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [hasDueDate, setHasDueDate] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        phase: initialData.phase || 'Pre Release Campaign',
        priority: initialData.priority || 'Medium',
        role: initialData.role || '',
        details: initialData.details || '',
        dayOfMonth: initialData.dayOfMonth || ''
      });
      setHasDueDate(!!initialData.dayOfMonth);
    } else {
      setFormData(emptyForm);
      setHasDueDate(false);
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      dayOfMonth: hasDueDate && formData.dayOfMonth ? Number(formData.dayOfMonth) : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <Card className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-outfit mb-6">
            {mode === 'edit' ? 'Edit Recurring Task Template' : 'New Recurring Task Template'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Task Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Publish 4 Facebook posts — week 1"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Phase</label>
                <select
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                >
                  {PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                <select
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Auto-assign to Role (optional)</label>
              <select
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="">-- Leave Unassigned --</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                When you click "Start New Month," this task auto-assigns to whoever holds this role on the Team page.
              </p>
            </div>

            <div className="space-y-2 border border-border rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/20">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasDueDate}
                  onChange={(e) => setHasDueDate(e.target.checked)}
                  className="rounded border-border text-red-600 focus:ring-red-600/20"
                />
                <span>This task has a fixed day each month (e.g. always due on the 7th)</span>
              </label>

              {hasDueDate && (
                <div className="pt-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Day of Month</label>
                  <input
                    required={hasDueDate}
                    type="number"
                    min="1"
                    max="31"
                    placeholder="e.g. 7"
                    className="w-full mt-1 bg-white dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Each month, the due date is automatically set to this day (e.g. 7 → July 7, August 7, etc.). If a month is shorter, it's clamped to the last day.
                  </p>
                </div>
              )}
              {!hasDueDate && (
                <p className="text-[11px] text-slate-400">
                  Unchecked = this task will be created as "Ongoing" with no due date, same as before.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Details (Optional)</label>
              <textarea
                rows="2"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20">
                {mode === 'edit' ? 'Save Changes' : 'Add Template'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TemplateModal;