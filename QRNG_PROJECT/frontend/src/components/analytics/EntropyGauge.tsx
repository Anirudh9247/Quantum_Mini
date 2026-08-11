'use client';

import React from 'react';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';

interface EntropyGaugeProps {
  entropy: number;
}

export const EntropyGauge: React.FC<EntropyGaugeProps> = ({ entropy }) => {
  return (
    <div className="glass-panel-glow p-5 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-semibold">Shannon Entropy</span>
        <ConceptTrigger conceptId="shannon_entropy">Help</ConceptTrigger>
      </div>
      <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
        {entropy.toFixed(4)}
      </p>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-cyan-400 h-full transition-all duration-700"
          style={{ width: `${Math.min(100, entropy * 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-cyan-400">Max entropy = 1.0000 (Perfect Unpredictability)</p>
    </div>
  );
};
