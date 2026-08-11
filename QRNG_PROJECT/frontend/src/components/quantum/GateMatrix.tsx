'use client';

import React from 'react';
import { GATE_DICTIONARY } from '@/lib/gates';

interface GateMatrixProps {
  gateType: string;
}

export const GateMatrix: React.FC<GateMatrixProps> = ({ gateType }) => {
  const gate = GATE_DICTIONARY[gateType] || GATE_DICTIONARY['H'];

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
          {gate.symbol}
        </span>
        <h4 className="text-xs font-bold text-white">{gate.name} Matrix</h4>
      </div>
      <p className="text-[11px] text-slate-400">{gate.description}</p>
      <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 whitespace-pre-wrap">
        {gate.matrix}
      </pre>
    </div>
  );
};
