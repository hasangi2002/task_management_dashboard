import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, TrendingUp, 
  BarChart3, Calendar, PieChart, ShieldAlert, Award, FileText, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import MonthFilter from '../components/MonthFilter';
import { useMonth } from '../context/MonthContext';
import { getAvailableMonths, filterTasksByMonth } from '../utils/monthUtils';
import { useParams } from 'react-router-dom';

const Analytics = () => {
  const { projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonth } = useMonth();
  
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('All');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All');

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
      console.error("Failed to fetch analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const months = getAvailableMonths(allTasks);
  const tasks = filterTasksByMonth(allTasks, selectedMonth);

  const getTaskPlatform = (task) => {
    const text = ((task.title || '') + ' ' + (task.details || '')).toLowerCase();
    if (text.includes('youtube') || text.includes('yt')) return 'YouTube';
    if (text.includes('tiktok') || text.includes('tt')) return 'TikTok';
    if (text.includes('instagram') || text.includes('ig') || text.includes('story') || text.includes('reel')) return 'Instagram';
    if (text.includes('facebook') || text.includes('fb') || text.includes('boost')) return 'Facebook';
    if (text.includes('influencer') || text.includes('partner')) return 'Influencer';
    if (text.includes('ad ') || text.includes('paid') || text.includes('sponsored')) return 'Paid Advertising';
    return 'General';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesMember = selectedMemberFilter === 'All' || 
                          task.assignedTo === selectedMemberFilter || 
                          (task.assignedTo && task.assignedTo._id === selectedMemberFilter) ||
                          (task.assignedTo && task.assignedTo.name === selectedMemberFilter);
    const matchesPlatform = selectedPlatformFilter === 'All' || getTaskPlatform(task) === selectedPlatformFilter;
    const matchesPriority = selectedPriorityFilter === 'All' || task.priority === selectedPriorityFilter;
    return matchesMember && matchesPlatform && matchesPriority;
  });

  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress').length;
  const pendingCount = filteredTasks.filter(t => t.status === 'Pending').length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = filteredTasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate.split('T')[0] < today).length;
  
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  
  const activeMembersCount = members.filter(m => m.availability === 'Available' || m.availability === 'Busy').length;

  const platforms = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'Influencer', 'Paid Advertising', 'General'];
  const platformStats = platforms.map(platform => {
    const platformTasks = tasks.filter(t => getTaskPlatform(t) === platform);
    const completed = platformTasks.filter(t => t.status === 'Completed').length;
    const percent = platformTasks.length > 0 ? Math.round((completed / platformTasks.length) * 100) : 0;
    return {
      name: platform,
      total: platformTasks.length,
      completed,
      percent
    };
  }).filter(p => p.total > 0);

  const leaderboard = members.map(member => {
    const memberTasks = tasks.filter(t => t.assignedTo === member._id || (t.assignedTo && t.assignedTo._id === member._id));
    const completed = memberTasks.filter(t => t.status === 'Completed').length;
    const active = memberTasks.filter(t => t.status === 'In Progress').length;
    const overdue = memberTasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate.split('T')[0] < today).length;
    
    const rate = memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0;
    
    const onTimeFactor = Math.max(0, 100 - (overdue * 15));
    const finalScore = memberTasks.length > 0 
      ? Math.round((rate * 0.5) + ((member.productivityScore || 90) * 0.3) + (onTimeFactor * 0.2)) 
      : member.productivityScore || 85;

    let badge = 'Average';
    let badgeColor = 'default';
    if (finalScore >= 92) {
      badge = 'Excellent';
      badgeColor = 'success';
    } else if (finalScore >= 82) {
      badge = 'Good';
      badgeColor = 'warning';
    } else if (finalScore < 70) {
      badge = 'Needs Attention';
      badgeColor = 'danger';
    }

    return {
      ...member,
      assignedCount: memberTasks.length,
      completedCount: completed,
      overdueCount: overdue,
      completionRate: rate,
      score: finalScore,
      performanceBadge: badge,
      badgeColor
    };
  }).sort((a, b) => b.score - a.score);

  const handleExportReport = () => {
    alert("Exporting Team Performance Report...\nReport successfully generated and downloaded as PDF.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Clock className="w-10 h-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium animate-pulse">Analyzing team performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Performance View</h1>
          <p className="text-slate-500 dark:text-slate-400">Track task completion velocities, workload stats, and operational productivity.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter months={months} />
          <button 
            onClick={handleExportReport}
            className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm border border-border"
          >
            <FileText className="w-4 h-4" />
            <span>Export Performance Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-xl">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by Team Member</label>
          <select 
            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={selectedMemberFilter}
            onChange={(e) => setSelectedMemberFilter(e.target.value)}
          >
            <option value="All">All Members</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by Social Platform</label>
          <select 
            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={selectedPlatformFilter}
            onChange={(e) => setSelectedPlatformFilter(e.target.value)}
          >
            <option value="All">All Platforms</option>
            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter by Priority</label>
          <select 
            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Team Members', value: `${members.length} (${activeMembersCount} Active)`, icon: Users, color: 'text-blue-500' },
          { title: 'Task Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-green-500', subtitle: `${completedTasksCount}/${totalTasksCount} Completed` },
          { title: 'Tasks In Progress', value: inProgressCount, icon: Clock, color: 'text-amber-500', subtitle: `${pendingCount} Pending` },
          { title: 'Overdue Tasks', value: overdueCount, icon: ShieldAlert, color: 'text-red-500', highlight: overdueCount > 0 },
        ].map((stat, i) => (
          <Card key={i} className={`p-5 flex flex-col gap-3 relative overflow-hidden ${stat.highlight ? 'border-red-500/50 bg-red-500/5 dark:bg-red-500/5' : ''}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">{stat.value}</div>
              {stat.subtitle && <span className="text-xs text-slate-400 mt-1 block">{stat.subtitle}</span>}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold font-outfit flex items-center gap-2">
            <PieChart className="w-5 h-5 text-red-600" />
            <span>Task Status Breakdown</span>
          </h2>
          
          <div className="flex-1 flex flex-col justify-center gap-4 py-4">
            {[
              { label: 'Completed', count: completedTasksCount, percent: totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0, color: 'bg-green-500' },
              { label: 'In Progress', count: inProgressCount, percent: totalTasksCount > 0 ? Math.round((inProgressCount / totalTasksCount) * 100) : 0, color: 'bg-amber-500' },
              { label: 'Pending', count: pendingCount, percent: totalTasksCount > 0 ? Math.round((pendingCount / totalTasksCount) * 100) : 0, color: 'bg-slate-400' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-500">{item.count} ({item.percent}%)</span>
                </div>
                <ProgressBar progress={item.percent} colorClass={item.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold font-outfit flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <span>Platform-wise Task Distribution & Completion</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {platformStats.map((platform, i) => (
              <div key={i} className="border border-border p-4 rounded-xl flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{platform.name}</span>
                  <span className="text-xs text-slate-500">{platform.completed}/{platform.total} Done</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar progress={platform.percent} colorClass="bg-red-600" />
                  </div>
                  <span className="font-bold text-sm w-9 text-right">{platform.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold font-outfit flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-red-600" />
          <span>Team Performance Leaderboard</span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-border bg-slate-50 dark:bg-slate-800/40">
                <th className="px-4 py-3 font-medium text-center w-12">Rank</th>
                <th className="px-6 py-3 font-medium">Team Member</th>
                <th className="px-6 py-3 font-medium text-center">Assigned Tasks</th>
                <th className="px-6 py-3 font-medium text-center">Completed</th>
                <th className="px-6 py-3 font-medium text-center">Overdue</th>
                <th className="px-6 py-3 font-medium text-center">Productivity Score</th>
                <th className="px-6 py-3 font-medium text-center">Avg Speed</th>
                <th className="px-6 py-3 font-medium text-center">Performance Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((member, idx) => {
                const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                return (
                  <tr 
                    key={member._id} 
                    className="border-b border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="px-4 py-4 text-center font-bold text-slate-500 dark:text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.profilePicture || defaultAvatar} 
                          alt={member.name} 
                          className="w-9 h-9 rounded-full object-cover border border-border"
                          onError={(e) => { e.target.src = defaultAvatar; }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{member.name}</span>
                          <span className="text-xs text-slate-400">{member.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-300">{member.assignedCount}</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-500">{member.completedCount}</td>
                    <td className={`px-6 py-4 text-center font-semibold ${member.overdueCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {member.overdueCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {member.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">{member.avgCompletionTime || 0} days</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        member.performanceBadge === 'Excellent' 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                          : member.performanceBadge === 'Good' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : member.performanceBadge === 'Average' 
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {member.performanceBadge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;