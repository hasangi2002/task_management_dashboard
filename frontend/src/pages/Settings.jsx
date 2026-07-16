import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Loader2, Save, UserPlus, Target } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const { projectId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const [viewsTarget, setViewsTarget] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [savingKpis, setSavingKpis] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const [projectRes, kpisRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/kpis`)
      ]);
      setName(projectRes.data.name);
      setDescription(projectRes.data.description || '');

      const viewsKpi = kpisRes.data.find(k => k.name === 'Views Target');
      const engagementKpi = kpisRes.data.find(k => k.name === 'Engagement Rate');
      setViewsTarget(viewsKpi ? viewsKpi.target : '');
      setEngagementRate(engagementKpi ? engagementKpi.target : '');
    } catch (error) {
      console.error('Failed to load project', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/projects/${projectId}`, { name, description });
      alert('Saved.');
    } catch (error) {
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKpis = async (e) => {
    e.preventDefault();
    try {
      setSavingKpis(true);
      await Promise.all([
        api.put(`/projects/${projectId}/kpis/upsert`, { name: 'Views Target', target: Number(viewsTarget) || 0 }),
        api.put(`/projects/${projectId}/kpis/upsert`, { name: 'Engagement Rate', target: Number(engagementRate) || 0 })
      ]);
      alert('KPI targets saved.');
    } catch (error) {
      alert('Failed to save KPI targets.');
    } finally {
      setSavingKpis(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setAddingAdmin(true);
      await api.post(`/projects/${projectId}/add-admin`, { email: adminEmail });
      alert(`${adminEmail} can now manage this project.`);
      setAdminEmail('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add admin.');
    } finally {
      setAddingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage this project's details, KPI targets, and admin access.</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold font-outfit uppercase text-slate-400 tracking-wider">Project Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Project Name</label>
            <input
              required
              type="text"
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Description (Optional)</label>
            <textarea
              rows="2"
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold font-outfit uppercase text-slate-400 tracking-wider">KPI Overview Targets</h2>
        </div>
        <p className="text-xs text-slate-500">These numbers show on the Dashboard's KPI Overview card.</p>
        <form onSubmit={handleSaveKpis} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Views Target</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1200000"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={viewsTarget}
                onChange={(e) => setViewsTarget(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1">Enter the raw number (e.g. 1200000 for 1.2M).</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Engagement Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 8.4"
                className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
                value={engagementRate}
                onChange={(e) => setEngagementRate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingKpis}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {savingKpis ? 'Saving...' : 'Save KPI Targets'}
          </button>
        </form>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold font-outfit uppercase text-slate-400 tracking-wider">Share Project Management</h2>
        <p className="text-xs text-slate-500">Add another admin account by email so they can also manage this project.</p>
        <form onSubmit={handleAddAdmin} className="flex gap-3">
          <input
            required
            type="email"
            placeholder="admin@company.com"
            className="flex-1 bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={addingAdmin}
            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Add
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Settings;