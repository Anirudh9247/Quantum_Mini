'use client';

import React from 'react';

interface BitDistributionProps {
  zeros: number;
  ones: number;
  sampleSize: number;
}

export const BitDistribution: React.FC<BitDistributionProps> = ({ zeros, ones, sampleSize }) => {
  const p0 = sampleSize > 0 ? (zeros / sampleSize) * 100 : 50;
  const p1 = sampleSize > 0 ? (ones / sampleSize) * 100 : 50;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-panel p-5">
        <span className="text-xs text-slate-400 font-semibold block mb-1">Zero Bits (|0⟩)</span>
        <p className="text-3xl font-extrabold text-cyan-400 font-mono">{zeros}</p>
        <p className="text-[10px] text-slate-500 mt-2">{p0.toFixed(1)}% of total measured bits</p>
      </div>

      <div className="glass-panel p-5">
        <span className="text-xs text-slate-400 font-semibold block mb-1">One Bits (|1⟩)</span>
        <p className="text-3xl font-extrabold text-purple-400 font-mono">{ones}</p>
        <p className="text-[10px] text-slate-500 mt-2">{p1.toFixed(1)}% of total measured bits</p>
      </div>
    </div>
  );
};
