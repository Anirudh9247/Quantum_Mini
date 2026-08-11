'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Database, Search, Filter, RefreshCw } from 'lucide-react';
import { getExperiments } from '@/lib/api';
import { ExperimentResult } from '@/types/experiment';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';

export default function HistoryPage() {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGenerator, setFilterGenerator] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getExperiments();
      if (response.success && response.data) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0));
        setExperiments(sortedData);
      } else {
        toast.error(response.error || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredExperiments = experiments.filter((exp) => {
    const matchesGenerator = filterGenerator === 'all' || exp.generator === filterGenerator;
    const matchesSearch =
      (exp.id?.toString() || '').includes(searchTerm) || exp.generator.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenerator && matchesSearch;
  });

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
            <Database className="w-6 h-6 text-cyan-400" /> Quantum Experiment Database Logs
          </h1>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Run ID or Generator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {['all', 'quantum', 'simulator', 'classical'].map((gen) => (
            <button
              key={gen}
              onClick={() => setFilterGenerator(gen)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                filterGenerator === gen
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {gen}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-900 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Generator Source</th>
                  <th className="p-4">Sample Size</th>
                  <th className="p-4 text-center">Zero Bits (|0⟩)</th>
                  <th className="p-4 text-center">One Bits (|1⟩)</th>
                  <th className="p-4 text-right">
                    <ConceptTrigger conceptId="shannon_entropy">Shannon Entropy</ConceptTrigger>
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {filteredExperiments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No experiment logs match the selected filter. Run simulations from the Control Center!
                    </td>
                  </tr>
                ) : (
                  filteredExperiments.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-mono font-semibold text-slate-300">#{exp.id}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            exp.generator === 'quantum'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : exp.generator === 'simulator'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {exp.generator.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{exp.sample_size} bits</td>
                      <td className="p-4 text-center font-mono text-slate-300">{exp.zeros}</td>
                      <td className="p-4 text-center font-mono text-slate-300">{exp.ones}</td>
                      <td className="p-4 text-right font-mono font-bold text-cyan-400">
                        {exp.entropy.toFixed(5)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}