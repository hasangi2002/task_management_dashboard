import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader2, Calendar as CalendarIcon, Infinity as InfinityIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const MyTasks = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { searchTerm } = useSearch();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to load tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const isMine = (task) => {
    const assignedId = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo);
    return assignedId === user.id;
  };

  const myTasks = tasks.filter(isMine);

  const toggleStatus = async (task) => {
    const currentIndex = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${task._id}`, { status: nextStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const filtered = myTasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || task.title.toLowerCase().includes(search) || task.phase.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400">Click a status badge to move it forward.</p>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-border rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600/20"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="text-xs text-slate-500">{filtered.length} of {myTasks.length} tasks</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Task Name</th>
                <th className="px-6 py-4 font-medium">Phase</th>
                <th className="px-6 py-4 font-medium">Status (Click to toggle)</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin text-red-600 inline mr-2" />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No tasks match.</td></tr>
              ) : (
                filtered.map(task => (
                  <tr key={task._id} className="border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex flex-col">
                        <span>{task.title}</span>
                        {task.details && <span className="text-xs font-normal text-slate-400 mt-0.5 line-clamp-1">{task.details}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{task.phase}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleStatus(task)} className="hover:opacity-80 transition-opacity">
                        <Badge variant="status" type={task.status} />
                      </button>
                    </td>
                    <td className="px-6 py-4"><Badge variant="priority" type={task.priority} /></td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {task.dueDate ? (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                          <InfinityIcon className="w-3.5 h-3.5" />
                          Ongoing
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

export default MyTasks;