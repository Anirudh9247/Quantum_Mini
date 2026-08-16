'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChart2, Cpu, Database, Zap, Activity, Sparkles } from 'lucide-react';
import { runExperiment, checkHealth } from '@/lib/api';
import { calculateQualityScore } from '@/lib/calculations';
import { ExperimentResult } from '@/types/experiment';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { BlochSphere } from '@/components/quantum/BlochSphere';
import { EntropyGauge } from '@/components/analytics/EntropyGauge';
import { BitDistribution } from '@/components/analytics/BitDistribution';
import { ChiSquareChart } from '@/components/analytics/ChiSquareChart';
import { QualityIndex } from '@/components/analytics/QualityIndex';
import { GlowButton } from '@/components/ui/GlowButton';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

const DashboardChart = dynamic(() => import('@/components/DashboardChart'), { ssr: false });

export default function DashboardPage() {
  const [sampleSize, setSampleSize] = useState(64);
  const [generator, setGenerator] = useState('simulator');
  const [loading, setLoading] = useState(false);
  const [computationStage, setComputationStage] = useState<number>(0);
  const [error, setError] = useState('');
  const [warmingUpMessage, setWarmingUpMessage] = useState('');
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const router = useRouter();
  const { level } = useLearningLevel();

  useEffect(() => {
    router.prefetch('/history');
    router.prefetch('/compare');
    router.prefetch('/studio');

    // Pre-flight health check
    checkHealth().then((ok) => setIsBackendHealthy(ok));
  }, [router]);

  const handleRunExperiment = async () => {
    setLoading(true);
    setError('');
    setWarmingUpMessage('');
    setComputationStage(1);

    const stage1Timer = setTimeout(() => setComputationStage(2), 500);
    const stage2Timer = setTimeout(() => setComputationStage(3), 1000);

    const warmupTimeout = setTimeout(() => {
      setWarmingUpMessage('Warming up backend server...');
      toast('Waking up server... please wait.', {
        icon: '⏳',
        duration: 8000,
      });
    }, 4000);

    try {
      const response = await runExperiment(generator, Number(sampleSize));

      if (response.success && response.data) {
        setComputationStage(4);
        setError('');
        setResult(response.data);
        toast.success('Quantum experiment completed successfully!');
      } else {
        setResult(null);
        setError(response.error || 'Failed to run experiment.');
        toast.error(response.error || 'Failed to run experiment.');
      }
    } catch {
      setResult(null);
      setError('Failed to run experiment. Ensure backend is running.');
      toast.error('Failed to run experiment. Ensure backend is running.');
    } finally {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(warmupTimeout);
      setWarmingUpMessage('');
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      { name: 'Zeros (|0⟩)', count: result.zeros },
      { name: 'Ones (|1⟩)', count: result.ones },
    ];
  }, [result]);

  const qualityScore = useMemo(() => {
    if (!result) return 0;
    return calculateQualityScore(result.entropy, result.chi_square || 0);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="glass-panel-glow p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusIndicator status={isBackendHealthy ? 'online' : 'offline'} label={isBackendHealthy ? 'Backend Engine Online' : 'Backend Connecting...'} />
            <span className="text-xs text-slate-400 font-mono">Mode: {level.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Quantum Randomness & Analytics Control Center
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Generate random bits using Qiskit quantum measurement simulation or physical quantum vacuum fluctuations (ANU QRNG API).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/studio"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all shadow-md"
          >
            <Cpu className="w-4 h-4" />
            Interactive Studio
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-slate-700"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Quantum vs Classical
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Setup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600" />

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Experiment Setup
            </h2>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="generator" className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                <span>Random Generator Source</span>
                <ConceptTrigger conceptId="qubit">What is QRNG?</ConceptTrigger>
              </label>
              <select
                id="generator"
                value={generator}
                onChange={(e) => setGenerator(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-md transition-all cursor-pointer"
              >
                <option value="simulator">Quantum Simulator (Qiskit Aer Measurement)</option>
                <option value="quantum">Physical QRNG (ANU Vacuum API)</option>
                <option value="classical">Classical PRNG (LCG Seeded)</option>
              </select>
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                {generator === 'simulator' && (
                  <span><strong>Quantum Simulator:</strong> Randomness generated through simulated quantum circuit measurement.</span>
                )}
                {generator === 'quantum' && (
                  <span><strong>Physical QRNG:</strong> True non-deterministic randomness derived from physical quantum vacuum fluctuations.</span>
                )}
                {generator === 'classical' && (
                  <span><strong>Classical PRNG:</strong> Deterministic algorithmic randomness generated from a seed state.</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="sampleSize" className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                <span>Sample Size (Number of Bits)</span>
                <span className="font-mono text-cyan-400">{sampleSize} bits</span>
              </label>
              <input
                id="sampleSize"
                type="range"
                min="8"
                max="1000"
                step="8"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <GlowButton onClick={handleRunExperiment} isLoading={loading} className="w-full">
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Simulating Circuit...' : 'Execute Quantum Experiment'}</span>
            </GlowButton>
            {warmingUpMessage && (
              <p className="text-[11px] text-cyan-300 text-center">{warmingUpMessage}</p>
            )}
          </div>

          <BlochSphere />
        </div>

        {/* Right Column: Computation Flow & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animated Quantum Computation Flow */}
          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Quantum Computation Pipeline
              </span>
              <ConceptTrigger conceptId="superposition">Superposition Guide</ConceptTrigger>
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-lg border transition-all ${
                computationStage >= 1 ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-semibold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] text-slate-400">Stage 1</div>
                <div>State Preparation |0⟩</div>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                computationStage >= 2 ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 font-semibold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] text-slate-400">Stage 2</div>
                <div>Hadamard Superposition</div>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                computationStage >= 3 ? 'bg-pink-950/60 border-pink-500/50 text-pink-300 font-semibold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] text-slate-400">Stage 3</div>
                <div>Measurement Collapse</div>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                computationStage >= 4 ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-semibold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="text-[10px] text-slate-400">Stage 4</div>
                <div>Random Bitstream</div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
              <div className="bg-slate-900/80 h-28 rounded-xl border border-slate-800" />
              <div className="bg-slate-900/80 h-28 rounded-xl border border-slate-800" />
              <div className="bg-slate-900/80 h-28 rounded-xl border border-slate-800" />
            </div>
          ) : result ? (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EntropyGauge entropy={result.entropy} />
                  <QualityIndex score={qualityScore} />
                </div>

                <BitDistribution zeros={result.zeros} ones={result.ones} sampleSize={result.sample_size} />

                <ChiSquareChart chiSquare={result.chi_square} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-6 h-80 flex flex-col">
                  <h3 className="text-sm font-bold text-white mb-4">Bit Frequency Distribution</h3>
                  <div className="flex-1">
                    <DashboardChart chartData={chartData} />
                  </div>
                </div>

                {result.distribution_plot && (
                  <div className="glass-panel p-4 flex flex-col items-center justify-center h-80">
                    <h3 className="text-sm font-bold text-white mb-2 self-start w-full">Backend Generated Plot</h3>
                    <img 
                      src={result.distribution_plot.startsWith('http') ? result.distribution_plot : `data:image/png;base64,${result.distribution_plot}`} 
                      alt="Distribution Plot" 
                      className="max-h-full max-w-full rounded-lg shadow-lg border border-slate-700 object-contain" 
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel border-dashed border-slate-800 h-80 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Activity className="w-12 h-12 text-cyan-500/40 animate-pulse" />
              <p className="text-sm text-slate-400">Configure parameters on the left and click &quot;Execute Quantum Experiment&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
