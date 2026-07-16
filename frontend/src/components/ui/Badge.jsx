import React from 'react';
import clsx from 'clsx';

const priorityColors = {
  'Critical': 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20',
  'High': 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-500/20',
  'Medium': 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20',
  'Low': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
};

const statusColors = {
  'Pending': 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20',
  'Completed': 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20',
};

export const Badge = ({ children, variant = 'status', type }) => {
  const colorClass = variant === 'priority' ? priorityColors[type] : statusColors[type];
  
  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium w-fit", colorClass)}>
      {children || type}
    </span>
  );
};
