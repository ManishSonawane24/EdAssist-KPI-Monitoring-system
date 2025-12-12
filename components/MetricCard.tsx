import React from 'react';
import { KPIMetric } from '../types';

interface MetricCardProps {
  data: KPIMetric;
  colorTheme?: 'blue' | 'emerald' | 'violet' | 'orange' | 'rose' | 'indigo';
  labels?: {
    today?: string;
    mtd?: string;
    ytd?: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, colorTheme = 'blue', labels }) => {
  const formatValue = (val: number | string, isCurrency?: boolean) => {
    if (val === '---' || val === null || val === undefined) return '-';
    if (typeof val === 'string') return val;
    if (isCurrency) return `$${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  const getThemeClasses = () => {
    switch(colorTheme) {
      case 'emerald': return 'group-hover:border-emerald-200 group-hover:bg-emerald-50/30';
      case 'violet': return 'group-hover:border-violet-200 group-hover:bg-violet-50/30';
      case 'orange': return 'group-hover:border-orange-200 group-hover:bg-orange-50/30';
      case 'rose': return 'group-hover:border-rose-200 group-hover:bg-rose-50/30';
      case 'indigo': return 'group-hover:border-indigo-200 group-hover:bg-indigo-50/30';
      default: return 'group-hover:border-blue-200 group-hover:bg-blue-50/30';
    }
  };

  return (
    <div className={`group relative p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${getThemeClasses()}`}>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-4 truncate pr-2">
        {data.label}
      </h3>
      
      <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100">
        <div className="text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-300 font-medium uppercase mb-1">{labels?.today || 'Today'}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatValue(data.today, data.isCurrency)}</p>
        </div>
        <div className="text-center pl-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-300 font-medium uppercase mb-1">{labels?.mtd || 'MTD'}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatValue(data.mtd, data.isCurrency)}</p>
        </div>
        <div className="text-center pl-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-300 font-medium uppercase mb-1">{labels?.ytd || 'YTD'}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatValue(data.ytd, data.isCurrency)}</p>
        </div>
      </div>
      
      {data.notes && (
        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-300 italic flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {data.notes}
          </p>
        </div>
      )}
    </div>
  );
};