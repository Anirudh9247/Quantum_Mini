'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Zap, Cpu, Sparkles } from 'lucide-react';
import { compareGenerators } from '@/lib/api';
import { ComparisonResult } from '@/types/experiment';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';

const CompareChart = dynamic(() => import('@/components/CompareChart'), { ssr: false });

const formatBinaryBytes = (bits: string, bitLength = 32) => {
  if (!bits) return '';
  const slice = bits.slice(0, bitLength);
  const bytes: string[] = [];
  for (let i = 0; i < slice.length; i += 8) {
    bytes.push(slice.slice(i, i + 8));
  }
  return bytes.join(' ');
};

const bitsToNumber = (bits: string, chunk = 32) => {
  if (!bits || bits.length < 1) return null;
  const slice = bits.slice(0, chunk);
  try {
    return Number.parseInt(slice, 2);
  } catch {
    return null;
  }
};

export default function ComparePage() {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warmingUpMessage, setWarmingUpMessage] = useState('');

  const handleCompare = async () => {
    setLoading(true);
    setError('');
    setWarmingUpMessage('');

    const warmupTimeout = setTimeout(() => {
      setWarmingUpMessage('Warming up server backend...');
      toast('Waking up server... please wait.', {
        icon: '⏳',
        duration: 8000,
      });
    }, 4000);

    try {
      const res = await compareGenerators(100);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Quantum vs Classical comparison complete!');
      } else {
        setError(res.error || 'Failed to fetch comparison.');
        toast.error(res.error || 'Failed to fetch comparison.');
      }
    } catch {
      setError('Failed to fetch comparison. Ensure backend is running.');
      toast.error('Failed to fetch comparison. Ensure backend is running.');
    } finally {
      clearTimeout(warmupTimeout);
      setWarmingUpMessage('');
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return result
      ? [
          { name: 'Quantum Simulator (Qiskit)', entropy: result.quantum_entropy },
          { name: 'Classical PRNG (LCG)', entropy: result.classical_entropy },
        ]
      : [];
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 text-xs mb-2 flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator Control Center
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" /> Quantum vs Classical RNG Showcase
          </h1>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-cyan-500/25 flex flex-col items-center disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? 'Comparing Sources...' : 'Execute Comparative Benchmark'}</span>
          </div>
          {warmingUpMessage && <span className="text-[10px] text-cyan-200 mt-0.5">{warmingUpMessage}</span>}
        </button>
      </div>

      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 border-r border-slate-800/80 pr-4">
          <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Quantum Measurement Randomness
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Derived from quantum state superposition measurement collapse. Cannot be predicted from prior measurement state.
          </p>
        </div>

        <div className="space-y-2 pl-2">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Classical Pseudo-Randomness (PRNG)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Uses math algorithms (e.g. Linear Congruential Generators). Given the initial seed value, the sequence is 100% deterministic.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 h-28 rounded-xl border border-slate-800" />
            <div className="bg-slate-900 h-28 rounded-xl border border-slate-800" />
          </div>
          <div className="bg-slate-900 h-64 rounded-xl border border-slate-800" />
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel-glow p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Quantum Shannon Entropy</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  Quantum Simulated
                </span>
              </div>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono">
                {result.quantum_entropy?.toFixed(4)}
              </p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  style={{ width: `${Math.min(100, (result.quantum_entropy || 0) * 100)}%` }}
                />
              </div>
            </div>

            <div className="glass-panel p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Classical Shannon Entropy</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  Pseudo Random
                </span>
              </div>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-mono">
                {result.classical_entropy?.toFixed(4)}
              </p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (result.classical_entropy || 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Quantum Bitstream Sample (First 32 Bits)</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/30 font-mono text-sm text-cyan-300 tracking-wider">
                {formatBinaryBytes(result.quantum_bits, 32)}
              </div>
              <p className="text-xs font-mono text-slate-400">
                Decimal Interpretation: <strong className="text-cyan-400">{bitsToNumber(result.quantum_bits)}</strong>
              </p>
            </div>

            <div className="glass-panel p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Classical Bitstream Sample (First 32 Bits)</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-blue-500/30 font-mono text-sm text-blue-300 tracking-wider">
                {formatBinaryBytes(result.classical_bits, 32)}
              </div>
              <p className="text-xs font-mono text-slate-400">
                Decimal Interpretation: <strong className="text-blue-400">{bitsToNumber(result.classical_bits)}</strong>
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 h-80">
            <h3 className="text-sm font-bold text-white mb-4">Entropy Benchmark Comparison</h3>
            <CompareChart chartData={chartData} />
          </div>

          {result.comparison_plot && (
            <div className="glass-panel p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-white mb-4 self-start">Entropy Distribution Analysis Plot</h3>
              <img 
                src={result.comparison_plot.startsWith('http') ? result.comparison_plot : `data:image/png;base64,${result.comparison_plot}`} 
                alt="Comparison Plot" 
                className="max-w-full rounded-xl border border-slate-700 shadow-xl" 
              />
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel border-dashed border-slate-800 h-72 flex flex-col items-center justify-center text-slate-500">
          <p className="text-sm">Click &quot;Execute Comparative Benchmark&quot; to run quantum vs classical comparison</p>
        </div>
      )}
    </div>
  );
}