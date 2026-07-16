import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ChevronLeft, ChevronRight, Plus, Loader2, Infinity as InfinityIcon,
  CalendarDays, Edit3, CheckCircle2, Trash2, X
} from 'lucide-react';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import { useParams } from 'react-router-dom';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

const PRIORITY_DOT = {
  Critical: 'bg-red-600',
  High: 'bg-orange-500',
  Medium: 'bg-blue-500',
  Low: 'bg-slate-400'
};

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTaskDateStr(task) {
  if (!task.dueDate) return null;
  return task.dueDate.split('T')[0];
}

const Calendar = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingTask, setEditingTask] = useState(null);

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
      console.error("Failed to fetch calendar data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(projectId){
      fetchData();
    }
  }, [projectId]);

  const getAssignedMember = (task) => {
    if (!task.assignedTo) return null;
    if (typeof task.assignedTo === 'object') return task.assignedTo;
    return members.find(m => m._id === task.assignedTo) || null;
  };

  // ---- Calendar grid construction ----
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
    if (cells.length >= 42) break;
  }

  const todayStr = formatDateStr(new Date());

  const tasksByDate = {};
  tasks.forEach(task => {
    const dateStr = getTaskDateStr(task);
    if (!dateStr) return;
    if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
    tasksByDate[dateStr].push(task);
  });

  const ongoingTasks = tasks.filter(t => !t.dueDate && t.status !== 'Completed');
  const selectedDayTasks = tasksByDate[selectedDate] || [];

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(formatDateStr(now));
  };

  const handleOpenCreateModal = (prefillDate) => {
    setModalMode('create');
    setEditingTask(prefillDate ? { dueDate: prefillDate } : null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (modalMode === 'edit' && editingTask && editingTask._id) {
        const res = await api.put(`/projects/${projectId}/tasks/${editingTask._id}`, taskData);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
      } else {
        await api.post(`/projects/${projectId}/tasks`, taskData);
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
      await api.put(`/projects/${projectId}/tasks/${task._id}`, { status: nextStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/projects/${projectId}/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedDateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">View and manage tasks by due date.</p>
        </div>
        <button
          onClick={() => handleOpenCreateModal(null)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <Card className="xl:col-span-2 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-outfit">{monthLabel}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToPrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            {Object.entries(PRIORITY_DOT).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {WEEKDAYS.map(day => <div key={day} className="py-1">{day}</div>)}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map(({ date, inMonth }, idx) => {
              const dateStr = formatDateStr(date);
              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const isPast = dateStr < todayStr;
              const hasIncomplete = dayTasks.some(t => t.status !== 'Completed');
              const isOverdueDay = isPast && hasIncomplete;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square min-h-[64px] rounded-lg border p-1.5 flex flex-col items-start gap-1 text-left transition-all
                    ${inMonth ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50/50 dark:bg-slate-900/10 opacity-50'}
                    ${isSelected ? 'border-red-600 ring-2 ring-red-600/20' : 'border-border hover:border-slate-300 dark:hover:border-slate-700'}
                    ${isOverdueDay && !isSelected ? 'border-red-500/40' : ''}
                  `}
                >
                  <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300'}
                  `}>
                    {date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {dayTasks.slice(0, 4).map(t => (
                      <span
                        key={t._id}
                        className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority] || 'bg-slate-400'} ${t.status === 'Completed' ? 'opacity-30' : ''}`}
                      ></span>
                    ))}
                    {dayTasks.length > 4 && (
                      <span className="text-[9px] text-slate-400 font-semibold">+{dayTasks.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Side panel: selected day + ongoing tasks */}
        <div className="space-y-6">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarDays className="w-4 h-4 text-red-600 shrink-0" />
                <h3 className="text-sm font-bold font-outfit truncate">{selectedDateLabel}</h3>
              </div>
              <button
                onClick={() => handleOpenCreateModal(selectedDate)}
                className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No tasks due on this day.</p>
              ) : (
                selectedDayTasks.map(task => {
                  const assignedMember = getAssignedMember(task);
                  return (
                    <div
                      key={task._id}
                      className="bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</h4>
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${PRIORITY_DOT[task.priority] || 'bg-slate-400'}`}></span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">{task.phase}</span>
                        {assignedMember && (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{assignedMember.name}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button onClick={() => toggleTaskStatus(task)} className="hover:opacity-80 transition-opacity">
                          <Badge variant="status" type={task.status} />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleTaskStatus(task)}
                            className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-500 transition-colors"
                            title="Toggle Status"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold font-outfit">Ongoing Tasks ({ongoingTasks.length})</h3>
            </div>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {ongoingTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">No ongoing tasks without a due date.</p>
              ) : (
                ongoingTasks.map(task => {
                  const assignedMember = getAssignedMember(task);
                  return (
                    <div
                      key={task._id}
                      onClick={() => handleOpenEditModal(task)}
                      className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg px-3 py-2 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                        {assignedMember && (
                          <p className="text-[10px] text-slate-400">{assignedMember.name}</p>
                        )}
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-slate-400'}`}></span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

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

export default Calendar;