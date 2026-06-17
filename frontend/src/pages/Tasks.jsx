import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Filter, MoreHorizontal, Calendar as CalendarIcon, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';
import TaskModal from '../components/TaskModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', taskData);
      fetchTasks();
    } catch (error) {
      alert("Failed to create task. Check if backend is running.");
      console.error(error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      setTasks(tasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track campaign tasks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              <span>Phase</span>
            </button>
          </div>
          <div className="text-xs text-slate-500">
            {tasks.length} total tasks
          </div>
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                      <span>Loading tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No tasks found. Create a new task to get started.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
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
                         <CalendarIcon className="w-3.5 h-3.5" />
                         <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleCreateTask} 
      />
    </div>
  );
};

export default Tasks;