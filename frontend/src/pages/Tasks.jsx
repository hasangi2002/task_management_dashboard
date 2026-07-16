import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Edit3, Calendar as CalendarIcon, CheckCircle2, Loader2, Trash2, Infinity as InfinityIcon, X, Bell } from 'lucide-react';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import MonthFilter from '../components/MonthFilter';
import { useSearch } from '../context/SearchContext';
import { useMonth } from '../context/MonthContext';
import { getAvailableMonths, filterTasksByMonth } from '../utils/monthUtils';

const PHASES = ['Pre Release Campaign', 'Trailer Drop Day', 'Trailer Release', 'Cinema Launch', 'Post Release'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const Tasks = () => {
  const { projectId } = useParams();
  const [allTasks, setAllTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingTask, setEditingTask] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');
  const { searchTerm, setSearchTerm } = useSearch();
  const { selectedMonth } = useMonth();

  const fetchData = async () => {

    try {

      setLoading(true);


      const [
        tasksRes,
        membersRes
      ] = await Promise.all([

        api.get(`/projects/${projectId}/tasks`),

        api.get(`/projects/${projectId}/users`)

      ]);



      setAllTasks(tasksRes.data);

      setMembers(membersRes.data);



    } catch(error) {

      console.error(
        "Failed to fetch tasks",
        error
      );


    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if(projectId){
      fetchData();
    }

  }, [projectId]);

  const months = getAvailableMonths(allTasks);
  const monthTasks = filterTasksByMonth(allTasks, selectedMonth);

  const getAssignedMember = (task) => {
    if (!task.assignedTo) return null;
    if (typeof task.assignedTo === 'object') return task.assignedTo;
    return members.find(m => m._id === task.assignedTo) || null;
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (modalMode === 'edit' && editingTask) {
        const res = await api.put(
          `/projects/${projectId}/tasks/${editingTask._id}`,
          taskData
        );
        setAllTasks(allTasks.map(t => t._id === editingTask._id ? res.data : t));
      } else {
        await api.post(
          `/projects/${projectId}/tasks`,
          taskData
        );
        fetchData();
      }
    } catch (error) {
      alert("Failed to save task. Check if backend is running.");
      console.error(error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const currentIndex = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];

    try {
      await api.put(
        `/projects/${projectId}/tasks/${task._id}`,
        {
          status: nextStatus
        }
      );
      setAllTasks(allTasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(
        `/projects/${projectId}/tasks/${id}`
      );
      setAllTasks(allTasks.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleNotifyNow = async (task) => {
    if (!task.assignedTo) {
      alert("Assign this task to a team member before sending a notification.");
      return;
    }
    try {
      const res = await api.post(`/notifications/task/${task._id}`);
      const { emailResult, user, kind } = res.data;
      const emailStatus = emailResult.success
        ? 'sent'
        : emailResult.skipped
          ? 'skipped (no email credentials configured)'
          : `failed (${emailResult.error || 'unknown error'})`;
      alert(`Notified ${user} (${kind}).\nEmail: ${emailStatus}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send notification.");
      console.error(error);
    }
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setPhaseFilter('All');
    setMemberFilter('All');
    setSearchTerm('');
  };

  const filteredTasks = monthTasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPhase = phaseFilter === 'All' || task.phase === phaseFilter;

    const assignedMember = getAssignedMember(task);
    const assignedId = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo);
    const matchesMember =
      memberFilter === 'All' ||
      (memberFilter === 'Unassigned' ? !task.assignedTo : assignedId === memberFilter);

    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search ||
      task.title.toLowerCase().includes(search) ||
      (task.details || '').toLowerCase().includes(search) ||
      task.phase.toLowerCase().includes(search) ||
      (assignedMember && assignedMember.name.toLowerCase().includes(search));

    return matchesStatus && matchesPhase && matchesMember && matchesSearch;
  });

  const hasActiveFilters = statusFilter !== 'All' || phaseFilter !== 'All' || memberFilter !== 'All' || searchTerm.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track campaign tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter months={months} />
          <button
            onClick={handleOpenCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-border rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600/20"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-border rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600/20"
            >
              <option value="All">All Phases</option>
              {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-border rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600/20"
            >
              <option value="All">All Members</option>
              <option value="Unassigned">Unassigned</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>

            {searchTerm && (
              <span className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-md">
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline px-1"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {hasActiveFilters ? `${filteredTasks.length} of ${monthTasks.length} tasks` : `${monthTasks.length} total tasks`}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Task Name</th>
                <th className="px-6 py-4 font-medium">Phase</th>
                <th className="px-6 py-4 font-medium">Assigned To</th>
                <th className="px-6 py-4 font-medium">Status (Click to toggle)</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                      <span>Loading tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : monthTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No tasks found for this month. Create a new task to get started.
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    No tasks match your current filters.{' '}
                    <button onClick={clearFilters} className="text-red-600 hover:underline font-medium">Clear filters</button>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const assignedMember = getAssignedMember(task);
                  const defaultAvatar = assignedMember
                    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(assignedMember.name)}`
                    : null;
                  return (
                    <tr key={task._id} className="border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex flex-col">
                          <span>{task.title}</span>
                          {task.details && <span className="text-xs font-normal text-slate-400 mt-0.5 line-clamp-1">{task.details}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          {task.phase}
                        </span>
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
                            <span className="text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">{assignedMember.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Badge variant="status" type={task.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="priority" type={task.priority} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {task.dueDate ? (
                            <>
                              <CalendarIcon className="w-3.5 h-3.5" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-blue-500 font-semibold">
                              <InfinityIcon className="w-3.5 h-3.5" />
                              Ongoing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleNotifyNow(task)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                            title="Notify Assigned Member Now (Email)"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                            title="Edit Task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-500 transition-colors"
                            title="Quick Toggle Status"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        mode={modalMode}
        initialData={editingTask}
        teamMembers={members}
      />
    </div>
  );
};

export default Tasks;