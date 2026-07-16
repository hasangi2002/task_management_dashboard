import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader2, ListChecks, CheckCircle2, Clock, AlertCircle, TrendingUp, Infinity as InfinityIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getAvailableMonths, filterTasksByMonth, formatMonthLabel, currentMonthStr } from '../../utils/monthUtils';

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const MemberMonthlyReviews = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${projectId}/tasks`);
        setAllTasks(res.data);
      } catch (error) {
        console.error('Failed to load monthly reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  const isMine = (task) => {
    const assignedId = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo);
    return assignedId === user.id;
  };

  const months = getAvailableMonths(allTasks);
  const monthTasks = filterTasksByMonth(allTasks, selectedMonth).filter(isMine);

  const toggleStatus = async (task) => {
    const currentIndex = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${task._id}`, { status: nextStatus });
      setAllTasks(allTasks.map(t => t._id === task._id ? res.data : t));
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const total = monthTasks.length;
  const completed = monthTasks.filter(t => t.status === 'Completed').length;
  const inProgress = monthTasks.filter(t => t.status === 'In Progress').length;
  const pending = monthTasks.filter(t => t.status === 'Pending').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Monthly Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400">Your task progress, month by month.</p>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border p-4 rounded-xl">
        <label className="text-xs font-semibold text-slate-500 uppercase">Viewing Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
        >
          {months.map(m => (
            <option key={m} value={m}>{formatMonthLabel(m)}{m === currentMonthStr() ? ' (Current)' : ''}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total', value: total, icon: ListChecks, color: 'text-blue-500' },
          { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-500' },
          { title: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-500' },
          { title: 'Pending', value: pending, icon: AlertCircle, color: 'text-red-500' },
          { title: '% Complete', value: `${percent}%`, icon: TrendingUp, color: 'text-red-600' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold font-outfit">{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-sm font-bold font-outfit">{formatMonthLabel(selectedMonth)} — My Tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Task Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {monthTasks.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No tasks for you this month.</td></tr>
              ) : (
                monthTasks.map(task => (
                  <tr key={task._id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{task.title}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(task)} className="hover:opacity-80">
                        <Badge variant="status" type={task.status} />
                      </button>
                    </td>
                    <td className="px-6 py-4"><Badge variant="priority" type={task.priority} /></td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : (
                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                          <InfinityIcon className="w-3.5 h-3.5" />Ongoing
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MemberMonthlyReviews;