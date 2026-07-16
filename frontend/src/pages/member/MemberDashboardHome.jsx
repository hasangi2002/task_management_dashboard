import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Clock, AlertCircle, ListTodo, Loader2, Calendar as CalendarIcon, Infinity as InfinityIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MemberDashboardHome = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/tasks`);
        setTasks(res.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
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

  const myTasks = tasks.filter(isMine);
  const completed = myTasks.filter(t => t.status === 'Completed').length;
  const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
  const pending = myTasks.filter(t => t.status === 'Pending').length;

  const today = new Date().toISOString().split('T')[0];
  const overdue = myTasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate.split('T')[0] < today);
  const dueSoon = myTasks
    .filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate.split('T')[0] >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's what's on your plate.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'My Tasks', value: myTasks.length, icon: ListTodo, color: 'text-blue-500' },
          { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-500' },
          { title: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-500' },
          { title: 'Pending', value: pending, icon: AlertCircle, color: 'text-red-500' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h2 className="text-sm font-bold font-outfit uppercase text-slate-400 tracking-wider">Upcoming Due Dates</h2>
          {dueSoon.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4">Nothing due soon.</p>
          ) : (
            dueSoon.map(task => (
              <div key={task._id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                  <p className="text-[11px] text-slate-400">{task.phase}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0 ml-3">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-sm font-bold font-outfit uppercase text-red-500 tracking-wider">Overdue</h2>
          {overdue.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-4">Nothing overdue. Nice work.</p>
          ) : (
            overdue.map(task => (
              <div key={task._id} className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                  <p className="text-[11px] text-slate-400">{task.phase}</p>
                </div>
                <Badge variant="priority" type={task.priority} />
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboardHome;