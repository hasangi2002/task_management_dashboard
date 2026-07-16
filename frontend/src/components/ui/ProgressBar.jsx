import React from 'react';
import clsx from 'clsx';

export const ProgressBar = ({ progress, className, colorClass = "bg-red-600" }) => {
  return (
    <div className={clsx("h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden", className)}>
      <div 
        className={clsx("h-full transition-all duration-500 rounded-full", colorClass)} 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
