import React from 'react';
import { Layers } from 'lucide-react';
import { useMonth } from '../context/MonthContext';
import { formatMonthLabel, currentMonthStr } from '../utils/monthUtils';

const MonthFilter = ({ months }) => {
  const { selectedMonth, setSelectedMonth } = useMonth();
  const thisMonth = currentMonthStr();

  return (
    <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg shrink-0">
      <Layers className="w-4 h-4 text-slate-400 shrink-0" />
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
      >
        <option value="All">All Months</option>
        {months.map(m => (
          <option key={m} value={m}>
            {formatMonthLabel(m)}{m === thisMonth ? ' (Current)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthFilter;