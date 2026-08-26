import { QubitState } from '@/types/quantum';

/**
 * Calculates single-qubit probability amplitudes and measurement probabilities
 * from polar angle theta and azimuthal angle phi.
 */
export function calculateQubitState(theta: number, phi: number): QubitState {
  const alpha = Math.cos(theta / 2);
  const betaMag = Math.sin(theta / 2);
  const p0 = alpha * alpha;
  const p1 = betaMag * betaMag;

  return {
    theta,
    phi,
    alpha,
    betaMag,
    p0,
    p1,
  };
}

/**
 * Converts polar/azimuthal angles to 3D Cartesian coordinates on the Bloch sphere
 */
export function anglesToCartesian(theta: number, phi: number) {
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  };
}

/**
 * Formats state in Dirac ket notation
 */
export function formatDiracState(alpha: number, betaMag: number, phi: number): string {
  if (Math.abs(alpha - 1) < 1e-4) return '|0⟩';
  if (Math.abs(betaMag - 1) < 1e-4) return '|1⟩';
  if (Math.abs(alpha - 1 / Math.SQRT2) < 1e-3 && Math.abs(betaMag - 1 / Math.SQRT2) < 1e-3) {
    if (Math.abs(phi) < 1e-3) return '1/√2 (|0⟩ + |1⟩)';
    if (Math.abs(phi - Math.PI) < 1e-3) return '1/√2 (|0⟩ - |1⟩)';
  }
  const phiFrac = (phi / Math.PI).toFixed(2);
  return `${alpha.toFixed(2)}|0⟩ + ${betaMag.toFixed(2)}e^(i${phiFrac}π)|1⟩`;
}
