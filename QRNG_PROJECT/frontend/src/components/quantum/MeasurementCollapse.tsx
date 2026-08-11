'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface MeasurementCollapseProps {
  onCollapse: () => void;
  isMeasuring: boolean;
  result: 0 | 1 | null;
}

export const MeasurementCollapse: React.FC<MeasurementCollapseProps> = ({
  onCollapse,
  isMeasuring,
  result,
}) => {
  return (
    <div className="space-y-2">
      {result !== null && (
        <div className={`p-2.5 rounded-lg border text-center font-mono font-bold text-xs ${
          result === 0 ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' : 'bg-purple-950/60 border-purple-500/50 text-purple-300'
        }`}>
          Wavefunction Collapsed {"->"} State |{result}⟩
        </div>
      )}
      <button
        onClick={onCollapse}
        disabled={isMeasuring}
        className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Play className={`w-3.5 h-3.5 ${isMeasuring ? 'animate-spin' : ''}`} />
        {isMeasuring ? 'Collapsing Superposition...' : 'Trigger Quantum Measurement'}
      </button>
    </div>
  );
};
