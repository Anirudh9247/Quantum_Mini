'use client';

import React, { useState, useEffect } from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { Play, Pause, SkipForward, RotateCcw, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import { GATE_DICTIONARY } from '@/lib/gates';
import { QuantumCircuitStep } from '@/types/quantum';
import { GateMatrix } from './GateMatrix';
import { motion, AnimatePresence } from 'framer-motion';

interface QuantumCircuitStudioProps {
  onStepStateChange?: (stepState: QuantumCircuitStep) => void;
}

export const QuantumCircuitStudio: React.FC<QuantumCircuitStudioProps> = ({ onStepStateChange }) => {
  const [circuit, setCircuit] = useState<string[]>(['H', 'M']);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedGateForMatrix, setSelectedGateForMatrix] = useState<string | null>(null);
  const { level } = useLearningLevel();

  const computeStepStates = (): QuantumCircuitStep[] => {
    const states: QuantumCircuitStep[] = [
      {
        stepIndex: 0,
        gateName: 'Initial State',
        stateDirac: '|0⟩',
        p0: 1.0,
        p1: 0.0,
        theta: 0,
        phi: 0,
        alpha: 1.0,
        beta: 0.0,
        explanation: 'Qubit initialized to ground state |0⟩ with 100% probability of 0.',
      },
    ];

    let currentAlpha = 1.0;
    let currentBeta = 0.0;
    let currentTheta = 0;
    let currentPhi = 0;

    circuit.forEach((gateType, idx) => {
      if (gateType === 'H') {
        const nextAlpha = (currentAlpha + currentBeta) / Math.SQRT2;
        const nextBeta = (currentAlpha - currentBeta) / Math.SQRT2;
        currentAlpha = nextAlpha;
        currentBeta = nextBeta;
        
        // Equal superposition |+> or |->
        if (Math.abs(currentBeta) > 0.001 && currentBeta < 0) {
          currentTheta = Math.PI / 2;
          currentPhi = Math.PI;
        } else {
          currentTheta = Math.PI / 2;
          currentPhi = 0;
        }

        states.push({
          stepIndex: idx + 1,
          gateName: 'Hadamard Gate (H)',
          stateDirac: currentPhi === Math.PI ? '1/√2 (|0⟩ - |1⟩)' : '1/√2 (|0⟩ + |1⟩)',
          p0: Math.pow(currentAlpha, 2),
          p1: Math.pow(currentBeta, 2),
          theta: currentTheta,
          phi: currentPhi,
          alpha: currentAlpha,
          beta: currentBeta,
          explanation: 'Hadamard gate creates equal superposition of |0⟩ and |1⟩.',
        });
      } else if (gateType === 'X') {
        const temp = currentAlpha;
        currentAlpha = currentBeta;
        currentBeta = temp;
        currentTheta = Math.PI - currentTheta;

        states.push({
          stepIndex: idx + 1,
          gateName: 'Pauli-X Gate (X)',
          stateDirac: currentAlpha === 1 ? '|0⟩' : '|1⟩',
          p0: Math.pow(currentAlpha, 2),
          p1: Math.pow(currentBeta, 2),
          theta: currentTheta,
          phi: currentPhi,
          alpha: currentAlpha,
          beta: currentBeta,
          explanation: 'Pauli-X gate inverted the probability amplitudes (bit flip).',
        });
      } else if (gateType === 'Z') {
        currentBeta = -currentBeta;
        currentPhi = currentPhi === 0 ? Math.PI : 0;

        states.push({
          stepIndex: idx + 1,
          gateName: 'Pauli-Z Gate (Z)',
          stateDirac: `${currentAlpha.toFixed(2)}|0⟩ ${currentBeta >= 0 ? '+' : '-'} ${Math.abs(currentBeta).toFixed(2)}|1⟩`,
          p0: Math.pow(currentAlpha, 2),
          p1: Math.pow(currentBeta, 2),
          theta: currentTheta,
          phi: currentPhi,
          alpha: currentAlpha,
          beta: currentBeta,
          explanation: 'Pauli-Z flipped the phase of amplitude |1⟩ by 180 degrees.',
        });
      } else if (gateType === 'M') {
        // Measurement collapse model: deterministic for 100% states, or simulated collapse
        const p0 = Math.pow(currentAlpha, 2);
        const outcome: 0 | 1 = p0 >= 0.99 ? 0 : p0 <= 0.01 ? 1 : (idx % 2 === 0 ? 0 : 1);
        const collapsedTheta = outcome === 0 ? 0 : Math.PI;

        states.push({
          stepIndex: idx + 1,
          gateName: 'Measurement (M)',
          stateDirac: `Measured: |${outcome}⟩ (State Collapsed)`,
          p0: outcome === 0 ? 1.0 : 0.0,
          p1: outcome === 1 ? 1.0 : 0.0,
          theta: collapsedTheta,
          phi: 0,
          alpha: outcome === 0 ? 1.0 : 0.0,
          beta: outcome === 1 ? 1.0 : 0.0,
          isMeasurement: true,
          collapsedResult: outcome,
          explanation: `Measurement observer collapsed superposition into deterministic outcome |${outcome}⟩ with 100% probability.`,
        });
      } else {
        states.push({
          stepIndex: idx + 1,
          gateName: `${gateType} Gate`,
          stateDirac: '|Ψ⟩',
          p0: Math.pow(currentAlpha, 2),
          p1: Math.pow(currentBeta, 2),
          theta: currentTheta,
          phi: currentPhi,
          alpha: currentAlpha,
          beta: currentBeta,
          explanation: `Applied ${gateType} phase rotation to qubit state.`,
        });
      }
    });

    return states;
  };

  const stepStates = computeStepStates();
  const currentStepState = stepStates[Math.min(activeStep, stepStates.length - 1)];

  useEffect(() => {
    if (onStepStateChange && currentStepState) {
      onStepStateChange(currentStepState);
    }
  }, [activeStep, circuit, onStepStateChange, currentStepState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= circuit.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, circuit.length]);

  const addGate = (gateType: string) => {
    if (circuit.length >= 8) return;
    setCircuit([...circuit, gateType]);
  };

  const removeGate = (index: number) => {
    const updated = [...circuit];
    updated.splice(index, 1);
    setCircuit(updated);
    if (activeStep > updated.length) {
      setActiveStep(updated.length);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Interactive Quantum Circuit Studio
          </h2>
          <p className="text-xs text-slate-400">
            Build quantum circuits and step through state transformations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStep(0)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            title="Reset Execution"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (!isPlaying && activeStep >= circuit.length) {
                setActiveStep(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : activeStep >= circuit.length ? 'Replay Execution' : 'Animate Execution'}
          </button>

          <button
            onClick={() => setActiveStep((prev) => Math.min(circuit.length, prev + 1))}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Add Quantum Gates:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(GATE_DICTIONARY).map((key) => {
            const gate = GATE_DICTIONARY[key];
            return (
              <button
                key={key}
                onClick={() => addGate(key)}
                className={`px-3 py-1.5 rounded-lg border bg-gradient-to-r ${gate.color} text-white font-bold text-xs shadow-sm hover:scale-105 transition-transform flex items-center gap-1.5`}
              >
                <Plus className="w-3 h-3" />
                {gate.symbol}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 overflow-x-auto">
        <div className="flex items-center min-w-[500px] gap-3 relative py-4">
          <div className="absolute left-10 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-cyan-500/30 z-0" />

          <div className="z-10 bg-slate-900 border border-cyan-500/50 text-cyan-400 font-mono font-bold px-3 py-2 rounded-lg text-xs shadow-md shrink-0 flex flex-col items-center">
            <span>q₀</span>
            <span className="text-[10px] text-slate-400">|0⟩</span>
          </div>

          {circuit.map((gateKey, idx) => {
            const gate = GATE_DICTIONARY[gateKey] || GATE_DICTIONARY['H'];
            const isCurrent = activeStep === idx + 1;

            return (
              <div key={idx} className="relative z-10 flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setActiveStep(idx + 1);
                    setSelectedGateForMatrix(gateKey);
                  }}
                  className={`cursor-pointer px-4 py-3 rounded-lg border bg-gradient-to-br ${gate.color} text-white font-mono font-bold text-sm shadow-lg flex flex-col items-center justify-center transition-all ${
                    isCurrent ? 'ring-4 ring-cyan-400/60 scale-110 shadow-cyan-500/50' : 'opacity-90'
                  }`}
                >
                  <span>{gate.symbol}</span>
                  <span className="text-[9px] font-sans opacity-80 mt-0.5">Step {idx + 1}</span>
                </motion.div>

                <button
                  onClick={() => removeGate(idx)}
                  className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                  title="Remove Gate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Step {activeStep} of {circuit.length}: {currentStepState.gateName}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              State: <strong className="text-cyan-300">{currentStepState.stateDirac}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStepState.explanation}
          </p>

          {level === 'scholar' && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300">
              State Vector: [{(Math.sqrt(currentStepState.p0)).toFixed(4)}, {(Math.sqrt(currentStepState.p1)).toFixed(4)}]ᵀ
            </div>
          )}
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            State Probabilities
          </span>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Outcome |0⟩</span>
                <span className="font-mono text-cyan-400">{(currentStepState.p0 * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  style={{ width: `${currentStepState.p0 * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Outcome |1⟩</span>
                <span className="font-mono text-purple-400">{(currentStepState.p1 * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(192,132,252,0.6)]"
                  style={{ width: `${currentStepState.p1 * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedGateForMatrix && (
          <div className="relative">
            <button
              onClick={() => setSelectedGateForMatrix(null)}
              className="absolute top-2 right-3 z-10 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <GateMatrix gateType={selectedGateForMatrix} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
