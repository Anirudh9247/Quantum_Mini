export interface ExperimentResult {
  id?: number;
  generator: 'quantum' | 'simulator' | 'classical' | string;
  sample_size: number;
  zeros: number;
  ones: number;
  entropy: number;
  chi_square?: number;
  distribution_plot?: string;
  created_at?: string;
}

export interface ComparisonResult {
  quantum_entropy: number;
  classical_entropy: number;
  quantum_bits: string;
  classical_bits: string;
  comparison_plot?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
