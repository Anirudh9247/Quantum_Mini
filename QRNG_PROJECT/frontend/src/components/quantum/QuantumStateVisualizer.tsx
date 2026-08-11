'use client';

import React from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { Layers, Sparkles } from 'lucide-react';
import { formatDiracState } from '@/lib/quantum';

interface QuantumStateVisualizerProps {
  alpha: number;
  betaMag: number;
  phi?: number;
  label?: string;
}

export const QuantumStateVisualizer: React.FC<QuantumStateVisualizerProps> = ({
  alpha,
  betaMag,
  phi = 0,
  label = 'Current Quantum State',
}) => {
  const { level } = useLearningLevel();

  const p0 = alpha * alpha;
  const p1 = betaMag * betaMag;
  const dirac = formatDiracState(alpha, betaMag, phi);

  return (
    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> {label}
        </span>
        <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
          {dirac}
        </span>
      </div>

      {/* Amplitude Bars */}
      <div className="space-y-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Probability Amplitudes (Complex Heights)
        </span>

        <div>
          <div className="flex justify-between text-slate-300 mb-1 font-mono">
            <span>|0⟩ Amplitude (α)</span>
            <span className="text-cyan-400">{alpha.toFixed(3)}</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              style={{ width: `${alpha * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1 font-mono">
            <span>|1⟩ Amplitude (β)</span>
            <span className="text-purple-400">{betaMag.toFixed(3)}</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-400 h-full transition-all duration-500 shadow-[0_0_8px_rgba(192,132,252,0.5)]"
              style={{ width: `${betaMag * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Measurement Probabilities */}
      <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Born Rule Measurement Probabilities (|α|², |β|²)
        </span>

        <div className="grid grid-cols-2 gap-2 text-center font-mono">
          <div className="bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30">
            <div className="text-[10px] text-slate-400">P(0)</div>
            <div className="text-sm font-bold text-cyan-300">{(p0 * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-purple-950/40 p-2 rounded-lg border border-purple-500/30">
            <div className="text-[10px] text-slate-400">P(1)</div>
            <div className="text-sm font-bold text-purple-300">{(p1 * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {level === 'scholar' && (
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
          State Vector: [{alpha.toFixed(4)}, {(betaMag * Math.cos(phi)).toFixed(4)} + {(betaMag * Math.sin(phi)).toFixed(4)}i]ᵀ
        </div>
      )}
    </div>
  );
};
