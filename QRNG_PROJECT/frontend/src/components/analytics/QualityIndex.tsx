'use client';

import React from 'react';

interface QualityIndexProps {
  score: number;
}

export const QualityIndex: React.FC<QualityIndexProps> = ({ score }) => {
  return (
    <div className="glass-panel p-4 flex items-center justify-between">
      <div>
        <span className="text-xs text-slate-300 font-semibold block">Educational Randomness Quality Index</span>
        <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
          Composite educational metric based on entropy & uniformity (not a formal NIST cryptographic certification).
        </span>
      </div>
      <div className="text-right shrink-0 ml-3">
        <span className="text-2xl font-extrabold font-mono text-cyan-400">{score}</span>
        <span className="text-xs text-slate-400"> / 100</span>
      </div>
    </div>
  );
};
