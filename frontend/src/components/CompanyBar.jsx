import React from 'react';
import { Sparkles } from 'lucide-react';

const CompanyBar = () => {
  return (
    <div className="h-8 bg-slate-900 dark:bg-black flex items-center justify-center gap-2 text-white text-xs font-medium tracking-wide sticky top-0 z-50">
      <Sparkles className="w-3 h-3 text-red-500" />
      <span>CrestPointMedia</span>
    </div>
  );
};

export default CompanyBar;