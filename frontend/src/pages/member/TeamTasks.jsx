import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader2, Calendar as CalendarIcon, Infinity as InfinityIcon, Lock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PHASES = ['Pre Release Campaign', 'Trailer Drop Day', 'Trailer Release', 'Cinema Launch', 'Post Release'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const TeamTasks = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, membersRes] = await Promise.all([
          api.get(`/projects/${projectId}/tasks`),
          api.get(`/projects/${projectId}/users`)
        ]);
        setTasks(tasksRes.data);
        setMembers(membersRes.data);
      } catch (error) {
        console.error('Failed to load team tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const getAssignedMember = (task) => {
    if (!task.assignedTo) return null;
    if (typeof task.assignedTo === 'object') return task.assignedTo;
    return members.find(m => m._id === task.assignedTo) || null;
  };

  const isMine = (task) => {
    const assignedId = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo);
    return assignedId === user.id;
  };

  const filtered = tasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPhase = phaseFilter === 'All' || task.phase === phaseFilter;
    const assignedId = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo);
    const matchesMember = memberFilter === 'All' || assignedId === memberFilter;
    return matchesStatus && matchesPhase && matchesMember;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400">See what everyone's working on. Only your own tasks are editable — do that from "My Tasks."</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-xl">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="All">All Phases</option>
          {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="All">All Members</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Task Name</th>
                <th className="px-6 py-4 font-medium">Phase</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin text-red-600 inline mr-2" />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No tasks match.</td></tr>
              ) : (
                filtered.map(task => {
                  const assignedMember = getAssignedMember(task);
                  const mine = isMine(task);
                  const defaultAvatar = assignedMember
                    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignedMember.name)}`
                    : null;
                  return (
                    <tr key={task._id} className={`border-b border-border last:border-0 transition-colors ${mine ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          {!mine && <Lock className="w-3 h-3 text-slate-300 shrink-0" />}
                          {task.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{task.phase}</span>
                      </td>
                      <td className="px-6 py-4">
                        {assignedMember ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignedMember.profilePicture || defaultAvatar}
                              alt={assignedMember.name}
                              className="w-6 h-6 rounded-full object-cover border border-border"
                              onError={(e) => { e.target.src = defaultAvatar; }}
                            />
                            <span className="text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                              {assignedMember.name}{mine ? ' (You)' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><Badge variant="status" type={task.status} /></td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeamTasks;