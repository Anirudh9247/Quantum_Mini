'use client';

import React from 'react';
import { useLearningLevel, LearningLevel } from '@/context/LearningLevelContext';
import { Layers } from 'lucide-react';

export const LearningLevelSelector: React.FC = () => {
  const { level, setLevel } = useLearningLevel();

  return (
    <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
      <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
        <Layers className="w-3 h-3 text-cyan-400" /> Depth:
      </span>
      {(['explorer', 'student', 'scholar'] as LearningLevel[]).map((lvl) => (
        <button
          key={lvl}
          onClick={() => setLevel(lvl)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all capitalize ${
            level === lvl
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={`Switch to ${lvl} learning mode`}
        >
          {lvl}
        </button>
      ))}
    </div>
  );
};
