import React from 'react';

interface SectionHeaderProps {
  title: string;
  colorClass?: string;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, colorClass = "bg-brand-600", icon }) => {
  return (
    <div className="flex items-center gap-3 mb-6 mt-10 pb-3 border-b border-slate-200 dark:border-slate-700">
      <div className={`w-1.5 h-6 ${colorClass} rounded-full shadow-sm`}></div>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h2>
      {icon && <span className="text-slate-400 dark:text-slate-300 ml-auto">{icon}</span>}
    </div>
  );
};