'use client';

import React from 'react';
import Link from 'next/link';
import { QuantumCircuitStudio } from '@/components/quantum/QuantumCircuitStudio';
import { BlochSphere } from '@/components/quantum/BlochSphere';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';
import { ArrowLeft, Cpu, BookOpen } from 'lucide-react';
import { useLearningLevel } from '@/context/LearningLevelContext';

export default function StudioPage() {
  const { level } = useLearningLevel();
  const [activeStepState, setActiveStepState] = React.useState<{ theta: number; phi: number } | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 text-xs mb-2 flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator Control Center
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" /> Flagship Quantum Interactive Studio & Simulator
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Level: <strong className="text-cyan-400 capitalize">{level}</strong>
          </span>
        </div>
      </div>

      {/* Main Flagship Pipeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Circuit Builder */}
        <div className="lg:col-span-2 space-y-6">
          <QuantumCircuitStudio
            onStepStateChange={(step) => {
              setActiveStepState({ theta: step.theta, phi: step.phi });
            }}
          />

          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Quantum Mechanics Primer
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quantum computers use quantum logic gates to rotate qubit state vectors on the <ConceptTrigger conceptId="bloch">Bloch Sphere</ConceptTrigger>. Applying a <ConceptTrigger conceptId="hadamard">Hadamard Gate (H)</ConceptTrigger> creates an equal <ConceptTrigger conceptId="superposition">Superposition</ConceptTrigger>, which collapses into a random bit outcome upon <ConceptTrigger conceptId="measurement">Measurement</ConceptTrigger>.
            </p>
          </div>
        </div>

        {/* Right Col: Bloch Sphere & State Vector Visualizer */}
        <div className="lg:col-span-1 space-y-6">
          <BlochSphere
            interactive={true}
            controlledTheta={activeStepState?.theta}
            controlledPhi={activeStepState?.phi}
          />
        </div>
      </div>
    </div>
  );
}
