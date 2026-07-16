import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  Plus, Search, Mail, Phone, Edit3, Trash2, X,
  CheckCircle, Clock, AlertCircle, Shield, Infinity as InfinityIcon
} from 'lucide-react';
import api from '../services/api';
import MonthFilter from '../components/MonthFilter';
import { useMonth } from '../context/MonthContext';
import { getAvailableMonths, filterTasksByMonth } from '../utils/monthUtils';

const roles = [
  "Project & Strategy Director",
  "Strategic Planning Director",
  "Operations & Audit Director",
  "Social Media & Content Manager",
  "AI Research & Development Specialist",
  "Other"
];

const Team = () => {
  const { projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonth } = useMonth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: roles[0],
    customRole: '',
    phone: '',
    availability: 'Available',
    profilePicture: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}/users`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setMembers(membersRes.data);
      setAllTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to fetch team data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const months = getAvailableMonths(allTasks);
  const tasks = filterTasksByMonth(allTasks, selectedMonth);

  const handleOpenAddModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: roles[0],
      customRole: '',
      phone: '',
      availability: 'Available',
      profilePicture: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member, e) => {
    e.stopPropagation();
    setModalMode('edit');
    const isCustomRole = !roles.includes(member.role);
    setFormData({
      _id: member._id,
      name: member.name,
      email: member.email,
      password: '',
      role: isCustomRole ? 'Other' : member.role,
      customRole: isCustomRole ? member.role : '',
      phone: member.phone || '',
      availability: member.availability || 'Available',
      profilePicture: member.profilePicture || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      role: formData.role === 'Other' ? formData.customRole.trim() : formData.role
    };
    delete payload.customRole;
    if (modalMode === 'edit' && !payload.password) delete payload.password;

    try {
      if (modalMode === 'create') {
        const res = await api.post(`/projects/${projectId}/users`, payload);
        setMembers([res.data, ...members]);
      } else {
        const res = await api.put(`/projects/${projectId}/users/${payload._id}`, payload);
        setMembers(members.map(m => m._id === payload._id ? res.data : m));
        if (selectedMember && selectedMember._id === payload._id) {
          setSelectedMember(res.data);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save member details.");
      console.error(error);
    }
  };

  const handleDeleteMember = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this team member? All their active tasks will become unassigned. Their login will stop working.")) return;
    try {
      await api.delete(`/projects/${projectId}/users/${id}`);
      setMembers(members.filter(m => m._id !== id));
      if (selectedMember && selectedMember._id === id) {
        setSelectedMember(null);
      }
      const tasksRes = await api.get(`/projects/${projectId}/tasks`);
      setAllTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to delete member", error);
    }
  };

  const handleAssignTask = async (taskId, memberId) => {
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, { assignedTo: memberId });
      setAllTasks(allTasks.map(t => t._id === taskId ? res.data : t));
    } catch (error) {
      console.error("Failed to assign task", error);
    }
  };

  const handleUnassignTask = async (taskId) => {
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, { assignedTo: null });
      setAllTasks(allTasks.map(t => t._id === taskId ? res.data : t));
    } catch (error) {
      console.error("Failed to unassign task", error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await api.put(`/projects/${projectId}/tasks/${task._id}`, { status: nextStatus });
      setAllTasks(allTasks.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getMemberTasks = (memberId) => {
    return tasks.filter(t => t.assignedTo === memberId || (t.assignedTo && t.assignedTo._id === memberId));
  };

  const getStats = (memberId) => {
    const memberTasks = getMemberTasks(memberId);
    const completed = memberTasks.filter(t => t.status === 'Completed').length;
    const active = memberTasks.filter(t => t.status === 'In Progress').length;
    const pending = memberTasks.filter(t => t.status === 'Pending').length;

    const today = new Date().toISOString().split('T')[0];
    const overdue = memberTasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate.split('T')[0] < today).length;

    let workloadPercent = 0;
    let workloadLabel = 'Low';

    if (active === 1) {
      workloadPercent = 25;
      workloadLabel = 'Low';
    } else if (active === 2) {
      workloadPercent = 50;
      workloadLabel = 'Medium';
    } else if (active === 3) {
      workloadPercent = 75;
      workloadLabel = 'Optimal';
    } else if (active >= 4) {
      workloadPercent = 100;
      workloadLabel = 'High';
    }

    return {
      total: memberTasks.length,
      completed,
      active,
      pending,
      overdue,
      workloadPercent,
      workloadLabel
    };
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || member.availability === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-500 text-green-500';
      case 'Busy': return 'bg-amber-500 text-amber-500';
      case 'On Leave': return 'bg-slate-400 text-slate-400';
      default: return 'bg-slate-500 text-slate-500';
    }
  };

  const getWorkloadBarColor = (percent) => {
    if (percent < 60) return 'bg-green-500';
    if (percent <= 85) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Clock className="w-10 h-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading team roster...</p>
        </div>
      </div>
    );
  }

  if (selectedMember) {
    const stats = getStats(selectedMember._id);
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name)}`;
    const memberTasks = getMemberTasks(selectedMember._id);
    const unassignedTasksThisMonth = tasks.filter(t => !t.assignedTo);

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMember(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-semibold text-sm cursor-pointer"
          >
            <span>← Back to Team Directory</span>
          </button>
          <MonthFilter months={months} />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card border border-border p-6 rounded-2xl relative overflow-hidden shadow-xs">
          <div className={`absolute top-0 left-0 bottom-0 w-2 ${selectedMember.availability === 'Available' ? 'bg-green-500' : selectedMember.availability === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
          <div className="flex gap-4 items-center">
            <img
              src={selectedMember.profilePicture || defaultAvatar}
              alt={selectedMember.name}
              className="w-16 h-16 rounded-full object-cover border border-border"
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
            <div>
              <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">{selectedMember.name}</h2>
              <p className="text-xs text-slate-500">{selectedMember.role}</p>
              <div className="mt-1 flex gap-2">
                <Badge variant={selectedMember.availability === 'Available' ? 'success' : selectedMember.availability === 'Busy' ? 'warning' : 'default'}>
                  {selectedMember.availability}
                </Badge>
              </div>
            </div>
          </div>
          <div className="md:ml-auto flex flex-col sm:flex-row gap-3 w-full md:w-auto text-xs text-slate-500 border-t md:border-t-0 border-border/60 pt-4 md:pt-0">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/30 border border-border px-3 py-1.5 rounded-lg">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMember.email}</span>
            </div>
            {selectedMember.phone && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/30 border border-border px-3 py-1.5 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMember.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <h3 className="text-base font-bold font-outfit flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Assigned Tasks ({memberTasks.length})</span>
            </h3>

            <div className="space-y-2">
              {memberTasks.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4">No tasks assigned to this member for the selected month.</p>
              ) : (
                memberTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/20 border border-border p-3.5 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{task.title}</h4>
                      <div className="flex flex-wrap gap-2 text-[10px] items-center">
                        <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{task.phase}</span>
                        <span className={`font-semibold ${task.priority === 'Critical' ? 'text-red-500' : task.priority === 'High' ? 'text-orange-500' : 'text-slate-500'}`}>
                          {task.priority} Priority
                        </span>
                        {task.dueDate ? (
                          <span className="text-slate-400">Due: {task.dueDate.split('T')[0]}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-500 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
                            <InfinityIcon className="w-3 h-3" />
                            Ongoing
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 active:scale-95 cursor-pointer ${
                          task.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' :
                          task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-border hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Click to toggle status (Pending -> In Progress -> Completed)"
                      >
                        {task.status}
                      </button>
                      <button
                        onClick={() => handleUnassignTask(task._id)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors px-2 py-1"
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm font-outfit uppercase text-slate-400 tracking-wider">Assign Task</h3>
              <div className="space-y-3">
                <select
                  id="unassigned-tasks"
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Select Unassigned Task --</option>
                  {unassignedTasksThisMonth.map(t => (
                    <option key={t._id} value={t._id}>{t.title} ({t.phase})</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const select = document.getElementById('unassigned-tasks');
                    if (select && select.value) {
                      handleAssignTask(select.value, selectedMember._id);
                      select.value = '';
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Assign to Member
                </button>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm font-outfit uppercase text-slate-400 tracking-wider">Workload & Status</h3>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Assigned Tasks:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.total}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Workload Rating:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.workloadLabel}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Pending Tasks:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.pending}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>In Progress:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.active}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span>Completed Tasks:</span>
                  <span className="font-semibold text-green-500">{stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Tasks:</span>
                  <span className={`font-semibold ${stats.overdue > 0 ? 'text-red-500' : 'text-slate-400'}`}>{stats.overdue}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Organize roles, balance capacity, and manage creative assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter months={months} />
          <button
            onClick={handleOpenAddModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            className="bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            {roles.filter(r => r !== 'Other').map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            className="bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border bg-slate-50/50 dark:bg-slate-900/10">
          <Shield className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-lg mb-1">No team members found</h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm">No members match your search or filter settings. Click the button below to add a member.</p>
          <button
            onClick={handleOpenAddModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add New Member
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const stats = getStats(member._id);
            const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;

            return (
              <Card
                key={member._id}
                onClick={() => setSelectedMember(member)}
                className="p-5 flex flex-col gap-4 cursor-pointer hover:translate-y-[-2px] hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-200 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${member.availability === 'Available' ? 'bg-green-500' : member.availability === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>

                <div className="flex justify-between items-start pt-2">
                  <div className="flex gap-3">
                    <div className="relative">
                      <img
                        src={member.profilePicture || defaultAvatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                        onError={(e) => { e.target.src = defaultAvatar; }}
                      />
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${getAvailabilityColor(member.availability)}`}></span>
                    </div>
                    <div>
                      <h3 className="font-bold font-outfit text-slate-800 dark:text-slate-100">{member.name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{member.role}</span>
                    </div>
                  </div>

                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenEditModal(member, e)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMember(member._id, e)}
                      className="p-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-b border-border/60 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center py-1">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned</span>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-200">{stats.total}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active</span>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-200">{stats.active}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Done</span>
                    <div className="text-base font-bold text-green-500">{stats.completed}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Overdue</span>
                    <div className={`text-base font-bold ${stats.overdue > 0 ? 'text-red-500' : 'text-slate-500'}`}>{stats.overdue}</div>
                  </div>
                </div>

                <div className="space-y-1 mt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Workload Status</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.workloadLabel}</span>
                  </div>
                  <ProgressBar
                    progress={stats.workloadPercent}
                    colorClass={getWorkloadBarColor(stats.workloadPercent)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <Card className="p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold font-outfit mb-6">
                {modalMode === 'create' ? 'Add New Team Member' : 'Edit Team Member Details'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Kasun Perera"
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email Address (used to log in)</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. kasun@maimara.lk"
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                  </label>
                  <input
                    required={modalMode === 'create'}
                    type="text"
                    minLength={6}
                    placeholder={modalMode === 'create' ? 'Set a login password' : '••••••••'}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Share this email + password with the member so they can log in.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                    <select
                      className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      {roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                    {formData.role === 'Other' && (
                      <input
                        required
                        type="text"
                        placeholder="Enter custom role"
                        className="w-full mt-2 bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                        value={formData.customRole}
                        onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Availability</label>
                    <select
                      className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option>Available</option>
                      <option>Busy</option>
                      <option>On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Profile Picture URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                    value={formData.profilePicture}
                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-600/20"
                  >
                    {modalMode === 'create' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;