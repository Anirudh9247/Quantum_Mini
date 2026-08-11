import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'busy' | 'offline';
  label?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const colors = {
    online: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    busy: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse',
    offline: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  };

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />
      {label && <span>{label}</span>}
    </div>
  );
};
