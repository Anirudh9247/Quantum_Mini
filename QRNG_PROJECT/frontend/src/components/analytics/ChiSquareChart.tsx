'use client';

import React from 'react';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';
import { ShieldCheck } from 'lucide-react';

interface ChiSquareChartProps {
  chiSquare?: number;
}

export const ChiSquareChart: React.FC<ChiSquareChartProps> = ({ chiSquare }) => {
  if (chiSquare === undefined) return null;

  const isPassing = chiSquare < 3.841;
  // Approximate p-value for 1 degree of freedom: p = erfc(sqrt(chi2 / 2))
  const approxPValue = chiSquare === 0 ? 1.0 : Math.max(0.0001, Math.exp(-chiSquare / 2) / Math.sqrt(Math.PI * (chiSquare / 2 + 0.5)));

  return (
    <div className="glass-panel p-5 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Chi-Square (χ²) Uniformity Statistic</span>
            <ConceptTrigger conceptId="chi_square">Explanation</ConceptTrigger>
          </div>
          <div className="flex items-baseline gap-3 mt-0.5">
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {chiSquare.toFixed(4)}
            </p>
            <span className="text-xs font-mono text-slate-400">
              (df = 1, p ≈ {approxPValue.toFixed(4)})
            </span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
          isPassing ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isPassing ? 'Passed Uniformity Verification (α=0.05)' : 'Statistically Notable Deviation'}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">
        {isPassing
          ? 'Observed 0/1 frequency counts align with expected uniform distribution for fair binary random sources.'
          : 'Single-sample deviation at α=0.05. Small sample sizes naturally exhibit fluctuation; does not establish generator bias.'}
      </p>
    </div>
  );
};
