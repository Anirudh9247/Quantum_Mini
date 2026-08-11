export interface QubitState {
  theta: number; // Polar angle [0, PI]
  phi: number;   // Azimuthal angle [0, 2*PI]
  alpha: number; // Real amplitude component for |0>
  betaMag: number; // Magnitude of amplitude for |1>
  p0: number;    // Probability of measuring 0 (|alpha|^2)
  p1: number;    // Probability of measuring 1 (|beta|^2)
}

export interface GateDefinition {
  type: string;
  name: string;
  symbol: string;
  description: string;
  matrix: string;
  color: string;
  category: 'superposition' | 'pauli' | 'phase' | 'measurement';
}

export interface QuantumCircuitStep {
  stepIndex: number;
  gateName: string;
  stateDirac: string;
  p0: number;
  p1: number;
  theta: number;
  phi: number;
  alpha: number;
  beta: number;
  explanation: string;
  isMeasurement?: boolean;
  collapsedResult?: 0 | 1;
}
