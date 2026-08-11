'use client';

import React from 'react';
import { useLearningLevel } from '@/context/LearningLevelContext';
import { Sparkles, BookOpen, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConceptDetail {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  explorer: {
    analogy: string;
    description: string;
    keyTakeaway: string;
  };
  student: {
    mathNotation: string;
    description: string;
    keyTakeaway: string;
  };
  scholar: {
    formalDefinition: string;
    matrixForm?: string;
    description: string;
    keyTakeaway: string;
  };
}

export const QUANTUM_CONCEPTS: Record<string, ConceptDetail> = {
  qubit: {
    id: 'qubit',
    title: 'Qubit (Quantum Bit)',
    subtitle: 'The fundamental unit of quantum information',
    icon: '⚛️',
    explorer: {
      analogy: 'Imagine a classical bit as a light switch that can only be OFF (0) or ON (1). A qubit is like a spinning coin in mid-air—while spinning, it holds both possibilities at once until it lands.',
      description: 'Unlike classical bits that store either a 0 or a 1, a qubit can exist in a continuum of states combining both 0 and 1.',
      keyTakeaway: 'Qubits enable exponential computational capacity compared to classical bits.',
    },
    student: {
      mathNotation: '|Ψ⟩ = α|0⟩ + β|1⟩  where  |α|² + |β|² = 1',
      description: 'A qubit is a two-state quantum mechanical system mathematically represented as a normalized unit vector in a 2-dimensional Hilbert space.',
      keyTakeaway: 'Probability of measuring |0⟩ is |α|² and measuring |1⟩ is |β|².',
    },
    scholar: {
      formalDefinition: 'ρ = |Ψ⟩⟨Ψ| = ½(I + r_x σ_x + r_y σ_y + r_z σ_z)',
      matrixForm: 'Vector representation: |0⟩ = [1, 0]ᵀ, |1⟩ = [0, 1]ᵀ',
      description: 'The state space is a 2D complex Hilbert space ℂ². Any state corresponds to a density operator ρ on ℂ² with Tr(ρ) = 1 and ρ ≥ 0.',
      keyTakeaway: 'Bloch vector r = (r_x, r_y, r_z) uniquely specifies pure and mixed single-qubit states within the unit ball.',
    },
  },
  superposition: {
    id: 'superposition',
    title: 'Quantum Superposition',
    subtitle: 'Existing in multiple states simultaneously',
    icon: '🌊',
    explorer: {
      analogy: 'Think of a musical chord where multiple notes sound at the same time. The qubit is vibrating with a combination of all notes until measured.',
      description: 'Superposition allows quantum systems to evaluate all possible outcomes simultaneously before measurement.',
      keyTakeaway: 'Superposition is what gives quantum computers their parallel processing power.',
    },
    student: {
      mathNotation: 'H|0⟩ = ½√2 |0⟩ + ½√2 |1⟩',
      description: 'A state |Ψ⟩ is in superposition if its expansion in the computational basis contains non-zero coefficients for multiple basis states.',
      keyTakeaway: 'Applying a Hadamard gate puts a deterministic state into an equal superposition.',
    },
    scholar: {
      formalDefinition: 'Linear combination of basis states: |Ψ⟩ = ∑ c_i |i⟩  with ∑ |c_i|² = 1',
      matrixForm: 'Superposition amplitude state: [1/√2,  1/√2]ᵀ',
      description: 'Superposition stems from the linearity of the Schrödinger equation. Any linear combination of solutions is also a valid state.',
      keyTakeaway: 'Phase relationships (coherence) between superposition components enable quantum interference.',
    },
  },
  hadamard: {
    id: 'hadamard',
    title: 'Hadamard Gate (H)',
    subtitle: 'The fundamental superposition creator',
    icon: '🔮',
    explorer: {
      analogy: 'The Hadamard gate is like flipping a coin into the air. It takes a definite answer (Heads or Tails) and turns it into a fair 50/50 spin.',
      description: 'It is the most important single-qubit gate in quantum computing, transforming classical 0s and 1s into superposition states.',
      keyTakeaway: 'The Hadamard gate creates randomness out of certainty.',
    },
    student: {
      mathNotation: 'H = ½√2 [[1, 1], [1, -1]]',
      description: 'Rotates the state vector by π radians around the (X+Z)/√2 axis of the Bloch sphere, mapping basis states |0⟩ and |1⟩ into equal superposition states |+⟩ and |-⟩.',
      keyTakeaway: 'Applying H twice returns the qubit to its original state (H² = I).',
    },
    scholar: {
      formalDefinition: 'H = (σ_x + σ_z) / √2',
      matrixForm: 'Matrix: 1/√2 * [ 1   1 ] \n         [ 1  -1 ]',
      description: 'Unital unitary operator satisfying H = H† = H⁻¹. Performs a Quantum Fourier Transform on a 1-qubit system.',
      keyTakeaway: 'H transforms computational basis {|0⟩, |1⟩} into Hadamard basis {|+⟩, |-⟩}.',
    },
  },
  measurement: {
    id: 'measurement',
    title: 'Measurement & Wavefunction Collapse',
    subtitle: 'Transitioning from quantum probability to classical reality',
    icon: '⚡',
    explorer: {
      analogy: 'When a spinning coin lands on the table and stops, its spinning superposition collapses into a single definite result: Heads (0) or Tails (1).',
      description: 'Measuring a qubit forces its probabilistic quantum state to collapse instantly into one definite classical outcome.',
      keyTakeaway: 'Measurement is irreversible and fundamentally random in quantum mechanics.',
    },
    student: {
      mathNotation: 'P(0) = |⟨0|Ψ⟩|² = |α|²,   P(1) = |⟨1|Ψ⟩|² = |β|²',
      description: 'According to Born\'s rule, the probability of obtaining outcome i upon measuring observable A is given by the squared magnitude of the inner product.',
      keyTakeaway: 'Post-measurement state is projected onto the eigenspace corresponding to the observed eigenvalue.',
    },
    scholar: {
      formalDefinition: 'Projection Operators: M_0 = |0⟩⟨0|,  M_1 = |1⟩⟨1|,   ∑ M_k = I',
      matrixForm: 'Collapse projection: ρ_after = (M_k ρ M_k†) / Tr(M_k ρ M_k†)',
      description: 'Von Neumann projective measurement models non-unitary state reduction under observable operator A = ∑ λ_k P_k.',
      keyTakeaway: 'Destroys phase coherence and resets the density matrix to a diagonal mixture.',
    },
  },
  shannon_entropy: {
    id: 'shannon_entropy',
    title: 'Shannon Entropy',
    subtitle: 'Quantitative measurement of randomness and information',
    icon: '📊',
    explorer: {
      analogy: 'Imagine a weather forecast. If it always says "sunny", the entropy is 0 (zero surprise). If it is a 50/50 coin flip between sun and rain, entropy is maximized.',
      description: 'Shannon Entropy measures how unpredictable a sequence of numbers is. Higher entropy means better, less predictable randomness.',
      keyTakeaway: 'A value of 1.0 represents perfect, un-hackable quantum randomness.',
    },
    student: {
      mathNotation: 'H(X) = - ∑ P(x_i) log₂ P(x_i)',
      description: 'Calculates the average information content per bit generated by the source. For a binary source with equal 0 and 1 probabilities, H(X) = 1.0 bit.',
      keyTakeaway: 'Classical pseudo-random numbers often exhibit hidden entropy drops over long samples.',
    },
    scholar: {
      formalDefinition: 'H(X) = E[-log₂ P(X)] ≤ log₂ |𝒳|',
      description: 'Asymptotic limit of lossless compression defined by Shannon\'s source coding theorem.',
      keyTakeaway: 'True physical QRNG sources achieve near-theoretical maximum entropy due to quantum vacuum fluctuations.',
    },
  },
  chi_square: {
    id: 'chi_square',
    title: 'Chi-Square (χ²) Uniformity Test',
    subtitle: 'Statistical verification of bit distribution fairness',
    icon: '⚖️',
    explorer: {
      analogy: 'If you roll a 6-sided die 60 times and get a "6" 50 times, you suspect it is loaded. The Chi-Square test mathematically detects if a random generator is biased.',
      description: 'It checks whether the count of 0s and 1s matches what we expect from a truly fair random process.',
      keyTakeaway: 'A low Chi-Square score close to 0 proves unbiased bit distribution.',
    },
    student: {
      mathNotation: 'χ² = ∑ (Observed - Expected)² / Expected',
      description: 'Compares the empirical frequency distribution of zero and one bits against the theoretical expected value (N/2).',
      keyTakeaway: 'If χ² < 3.84 (for 1 degree of freedom at p=0.05), the bit sequence passes the fairness test.',
    },
    scholar: {
      formalDefinition: 'χ² = (O_0 - E_0)² / E_0 + (O_1 - E_1)² / E_1',
      description: 'Goodness-of-fit statistic asymptotically following a chi-square distribution with k - 1 degrees of freedom.',
      keyTakeaway: 'Evaluates null hypothesis H₀: the bit source produces independent identically distributed bits.',
    },
  },
};

interface QuantumConceptModalProps {
  conceptId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuantumConceptModal: React.FC<QuantumConceptModalProps> = ({ conceptId, isOpen, onClose }) => {
  const { level, setLevel } = useLearningLevel();

  if (!isOpen || !conceptId || !QUANTUM_CONCEPTS[conceptId]) return null;

  const concept = QUANTUM_CONCEPTS[conceptId];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass-panel-glow p-6 overflow-hidden border border-cyan-500/40 text-slate-100 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{concept.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {concept.title}
                </h3>
                <p className="text-xs text-cyan-400">{concept.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg mb-6 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Explanation Depth:
            </span>
            <div className="flex gap-1">
              {(['explorer', 'student', 'scholar'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    level === lvl
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed min-h-[160px]">
            {level === 'explorer' && (
              <div className="space-y-3">
                <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-lg text-cyan-200">
                  <span className="font-semibold text-cyan-400 block text-xs uppercase tracking-wider mb-1">
                    💡 Everyday Analogy
                  </span>
                  {concept.explorer.analogy}
                </div>
                <p className="text-slate-300">{concept.explorer.description}</p>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center gap-2 text-xs text-cyan-300 font-medium">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  Key Takeaway: {concept.explorer.keyTakeaway}
                </div>
              </div>
            )}

            {level === 'student' && (
              <div className="space-y-3">
                <div className="bg-purple-950/30 border border-purple-500/30 p-3.5 rounded-lg font-mono text-xs text-purple-300">
                  <span className="font-sans font-semibold text-purple-400 block text-xs uppercase tracking-wider mb-1">
                    📐 Mathematical Notation
                  </span>
                  {concept.student.mathNotation}
                </div>
                <p className="text-slate-300">{concept.student.description}</p>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center gap-2 text-xs text-purple-300 font-medium">
                  <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                  Key Takeaway: {concept.student.keyTakeaway}
                </div>
              </div>
            )}

            {level === 'scholar' && (
              <div className="space-y-3">
                <div className="bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-lg font-mono text-xs text-emerald-300 space-y-2">
                  <div>
                    <span className="font-sans font-semibold text-emerald-400 block text-xs uppercase tracking-wider mb-1">
                      🔬 Formal Definition
                    </span>
                    {concept.scholar.formalDefinition}
                  </div>
                  {concept.scholar.matrixForm && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="font-sans font-semibold text-emerald-400 block text-xs uppercase tracking-wider mb-1">
                        Matrix Operator
                      </span>
                      <pre className="text-emerald-200 whitespace-pre-wrap">{concept.scholar.matrixForm}</pre>
                    </div>
                  )}
                </div>
                <p className="text-slate-300">{concept.scholar.description}</p>
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-medium">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  Key Takeaway: {concept.scholar.keyTakeaway}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
