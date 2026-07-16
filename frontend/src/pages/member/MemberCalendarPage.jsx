import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronLeft, ChevronRight, Loader2, Infinity as InfinityIcon, CalendarDays } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITY_DOT = { Critical: 'bg-red-600', High: 'bg-orange-500', Medium: 'bg-blue-500', Low: 'bg-slate-400' };

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MemberCalendarPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateStr(new Date()));

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/projects/${projectId}/tasks`);
        setTasks(res.data);
      } catch (error) {
        console.error('Failed to load calendar', error);
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

  const toggleStatus = async (task) => {
    if (!isMine(task)) return;
    const currentIndex = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${task._id}`, { status: nextStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  const todayStr = formatDateStr(new Date());
  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.dueDate) return;
    const dateStr = task.dueDate.split('T')[0];
    if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
    tasksByDate[dateStr].push(task);
  });

  const selectedDayTasks = tasksByDate[selectedDate] || [];
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedDateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-slate-500 dark:text-slate-400">Your tasks are toggleable; others are shown for context.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-outfit">{monthLabel}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {WEEKDAYS.map(day => <div key={day} className="py-1">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map(({ date, inMonth }, idx) => {
              const dateStr = formatDateStr(date);
              const dayTasks = tasksByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square min-h-[64px] rounded-lg border p-1.5 flex flex-col items-start gap-1 text-left transition-all
                    ${inMonth ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50/50 dark:bg-slate-900/10 opacity-50'}
                    ${isSelected ? 'border-red-600 ring-2 ring-red-600/20' : 'border-border hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  <span className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {dayTasks.slice(0, 4).map(t => (
                      <span key={t._id} className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority] || 'bg-slate-400'} ${t.status === 'Completed' ? 'opacity-30' : ''}`}></span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold font-outfit">{selectedDateLabel}</h3>
          </div>
          <div className="space-y-2 max-h-[440px] overflow-y-auto">
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No tasks due this day.</p>
            ) : (
              selectedDayTasks.map(task => {
                const mine = isMine(task);
                return (
                  <div key={task._id} className={`border rounded-lg p-3 space-y-2 ${mine ? 'bg-red-50/40 dark:bg-red-900/10 border-red-500/20' : 'bg-slate-50 dark:bg-slate-900/30 border-border'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</h4>
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${PRIORITY_DOT[task.priority] || 'bg-slate-400'}`}></span>
                    </div>
                    <button onClick={() => toggleStatus(task)} disabled={!mine} className={mine ? 'hover:opacity-80' : 'cursor-not-allowed opacity-80'}>
                      <Badge variant="status" type={task.status} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemberCalendarPage;