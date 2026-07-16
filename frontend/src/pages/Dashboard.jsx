import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CheckCircle, Clock, AlertCircle, ListTodo, Loader2 } from 'lucide-react';
import api from '../services/api';
import MonthFilter from '../components/MonthFilter';
import { useMonth } from '../context/MonthContext';
import { getAvailableMonths, filterTasksByMonth } from '../utils/monthUtils';
import {useParams} from 'react-router-dom';
import { formatCompactNumber } from '../utils/formatUtils';

const Dashboard = () => {
  const { projectId } = useParams();
  const [allTasks, setAllTasks] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonth } = useMonth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, kpisRes] = await Promise.all([
          api.get(`/projects/${projectId}/tasks`),
          api.get(`/projects/${projectId}/kpis`)
        ]);
        setAllTasks(tasksRes.data);
        setKpis(kpisRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchData();
  }, [projectId]);

  const months = getAvailableMonths(allTasks);
  const tasks = filterTasksByMonth(allTasks, selectedMonth);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const viewsTargetKpi = kpis.find(k => k.name === 'Views Target');
  const engagementKpi = kpis.find(k => k.name === 'Engagement Rate');
  const viewsTargetDisplay = viewsTargetKpi ? formatCompactNumber(viewsTargetKpi.target) : '—';
  const engagementDisplay = engagementKpi ? `${engagementKpi.target}%` : '—';

  const phases = [
    'Pre Release Campaign',
    'Trailer Drop Day',
    'Trailer Release',
    'Cinema Launch',
    'Post Release'
  ];

  const phaseStats = phases.map(phaseName => {
    const phaseTasks = tasks.filter(t => t.phase === phaseName);
    const completed = phaseTasks.filter(t => t.status === 'Completed').length;
    const progress = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;
    return {
      name: phaseName,
      progress,
      tasks: `${completed}/${phaseTasks.length}`
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium">Synchronizing campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Track the Mai Mara Prasangaya campaign performance.</p>
        </div>
        <MonthFilter months={months} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'text-blue-500' },
          { title: 'Completed', value: completedTasks, icon: CheckCircle, color: 'text-green-500' },
          { title: 'In Progress', value: inProgressTasks, icon: Clock, color: 'text-amber-500' },
          { title: 'Pending', value: pendingTasks, icon: AlertCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-500">{stat.title}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold font-outfit">{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 flex flex-col gap-4 min-h-[300px]">
           <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold">Campaign Progress by Phase</h2>
             <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">Overall: {overallProgress}%</span>
           </div>
           
           <div className="space-y-5 mt-4 flex-1 justify-center flex flex-col">
              {phaseStats.map((phase, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{phase.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">{phase.tasks} Tasks</span>
                      <span className="font-bold w-9 text-right">{phase.progress}%</span>
                    </div>
                  </div>
                  <ProgressBar progress={phase.progress} colorClass={phase.progress === 100 ? "bg-green-500" : "bg-red-600"} />
                </div>
              ))}
           </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold">KPI Overview</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="80" 
                  className="stroke-red-600 transition-all duration-1000 ease-out" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="502" 
                  strokeDashoffset={502 - (502 * overallProgress / 100)} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-4xl font-bold font-outfit">{overallProgress}%</div>
                <div className="text-xs text-slate-500 mt-1">Campaign Done</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500">Views Target</div>
              <div className="font-bold">{viewsTargetDisplay}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg text-center">
              <div className="text-xs text-slate-500">Engagement</div>
              <div className="font-bold text-green-500">{engagementDisplay}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;