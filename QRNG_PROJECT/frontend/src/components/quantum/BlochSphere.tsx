'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { Sparkles } from 'lucide-react';
import { ConceptTrigger } from '@/components/education/ConceptTooltip';
import { calculateQubitState } from '@/lib/quantum';
import { QuantumStateVisualizer } from './QuantumStateVisualizer';
import { MeasurementCollapse } from './MeasurementCollapse';

interface BlochSphereProps {
  initialTheta?: number;
  initialPhi?: number;
  controlledTheta?: number;
  controlledPhi?: number;
  interactive?: boolean;
  onStateChange?: (state: { theta: number; phi: number; p0: number; p1: number }) => void;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  initialTheta = Math.PI / 2, // Default equal superposition |+>
  initialPhi = 0,
  controlledTheta,
  controlledPhi,
  interactive = true,
  onStateChange,
}) => {
  const [theta, setTheta] = useState(controlledTheta !== undefined ? controlledTheta : initialTheta);
  const [phi, setPhi] = useState(controlledPhi !== undefined ? controlledPhi : initialPhi);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<0 | 1 | null>(null);

  useEffect(() => {
    if (controlledTheta !== undefined) {
      setTheta(controlledTheta);
    }
  }, [controlledTheta]);

  useEffect(() => {
    if (controlledPhi !== undefined) {
      setPhi(controlledPhi);
    }
  }, [controlledPhi]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { level } = useLearningLevel();

  const qubitState = calculateQubitState(theta, phi);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ theta, phi, p0: qubitState.p0, p1: qubitState.p1 });
    }
  }, [theta, phi, qubitState.p0, qubitState.p1, onStateChange]);

  // Handle measurement collapse simulation
  const handleMeasure = () => {
    if (isMeasuring) return;
    setIsMeasuring(true);
    setMeasurementResult(null);

    const rand = Math.random();
    const outcome: 0 | 1 = rand < qubitState.p0 ? 0 : 1;

    const targetTheta = outcome === 0 ? 0 : Math.PI;
    const startTheta = theta;
    const startTime = performance.now();
    const duration = 600;

    const animateCollapse = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentTheta = startTheta + (targetTheta - startTheta) * ease;

      setTheta(currentTheta);

      if (progress < 1) {
        requestAnimationFrame(animateCollapse);
      } else {
        setIsMeasuring(false);
        setMeasurementResult(outcome);
      }
    };

    requestAnimationFrame(animateCollapse);
  };

  // Render 3D Projected Bloch Sphere on 2D Canvas without scene recreation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.36;

    ctx.clearRect(0, 0, width, height);

    // Outer Atmosphere Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.2);
    glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
    glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Main Sphere
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Equator
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vertical Axis (Z)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.15);
    ctx.lineTo(cx, cy + r * 1.15);
    ctx.stroke();

    // X/Y Axes
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.1, cy + r * 0.25);
    ctx.lineTo(cx + r * 1.1, cy - r * 0.25);
    ctx.stroke();

    // Pole Markers
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', cx, cy - r * 1.22);

    ctx.fillStyle = '#c084fc';
    ctx.fillText('|1⟩', cx, cy + r * 1.32);

    // State Vector
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    const projX = cx + r * (x * 0.85 + y * 0.35);
    const projY = cy - r * z * 0.95 + r * (y * 0.25 - x * 0.1);

    // Trace Line
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(projX, projY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow
    const arrowGrad = ctx.createLinearGradient(cx, cy, projX, projY);
    arrowGrad.addColorStop(0, '#00f0ff');
    arrowGrad.addColorStop(1, '#ff007f');

    ctx.strokeStyle = arrowGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(projX, projY);
    ctx.stroke();

    // Arrow Head Dot
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(projX, projY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('|Ψ⟩', projX + 12, projY - 4);
  }, [theta, phi]);

  const applyPreset = (presetTheta: number, presetPhi: number) => {
    setTheta(presetTheta);
    setPhi(presetPhi);
    setMeasurementResult(null);
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <ConceptTrigger conceptId="bloch">Bloch Sphere Visualizer</ConceptTrigger>
        </h3>
      </div>

      <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="w-full h-full max-w-[280px] max-h-[280px]"
        />
      </div>

      <div className="w-full mt-3">
        <QuantumStateVisualizer
          alpha={qubitState.alpha}
          betaMag={qubitState.betaMag}
          phi={phi}
          label="State Vector Amplitudes"
        />
      </div>

      {interactive && (
        <div className="w-full mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Polar Angle (θ)</span>
              <span>{(theta * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.02"
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Azimuthal Phase Angle (φ)</span>
              <span>{(phi * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.02"
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          <div className="flex justify-between gap-1 pt-1">
            <button
              onClick={() => applyPreset(0, 0)}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 rounded border border-slate-800 transition-colors"
            >
              State |0⟩
            </button>
            <button
              onClick={() => applyPreset(Math.PI, 0)}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 rounded border border-slate-800 transition-colors"
            >
              State |1⟩
            </button>
            <button
              onClick={() => applyPreset(Math.PI / 2, 0)}
              className="px-2 py-1 bg-cyan-950/50 hover:bg-cyan-900/50 text-[11px] text-cyan-300 rounded border border-cyan-700/50 transition-colors"
            >
              |+⟩ Hadamard
            </button>
            <button
              onClick={() => applyPreset(Math.PI / 2, Math.PI)}
              className="px-2 py-1 bg-purple-950/50 hover:bg-purple-900/50 text-[11px] text-purple-300 rounded border border-purple-700/50 transition-colors"
            >
              |-⟩ State
            </button>
          </div>

          <MeasurementCollapse
            onCollapse={handleMeasure}
            isMeasuring={isMeasuring}
            result={measurementResult}
          />
        </div>
      )}
    </div>
  );
};
