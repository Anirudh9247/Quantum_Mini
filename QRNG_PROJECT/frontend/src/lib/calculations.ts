/**
 * Calculates Shannon entropy from counts of 0s and 1s
 */
export function calculateShannonEntropy(zeros: number, ones: number): number {
  const total = zeros + ones;
  if (total === 0) return 0;

  const p0 = zeros / total;
  const p1 = ones / total;

  let entropy = 0;
  if (p0 > 0) entropy -= p0 * Math.log2(p0);
  if (p1 > 0) entropy -= p1 * Math.log2(p1);

  return entropy;
}

/**
 * Calculates Chi-Square uniformity test statistic
 */
export function calculateChiSquare(zeros: number, ones: number): number {
  const total = zeros + ones;
  if (total === 0) return 0;

  const expected = total / 2;
  const chi0 = Math.pow(zeros - expected, 2) / expected;
  const chi1 = Math.pow(ones - expected, 2) / expected;

  return chi0 + chi1;
}

/**
 * Calculates a 0-100 Randomness Quality Index score
 */
export function calculateQualityScore(entropy: number, chiSquare: number): number {
  // Entropy score (ideal is 1.0)
  const entropyScore = Math.min(100, entropy * 100);

  // Chi square penalty (ideal is close to 0; critical value for 1 df at p=0.05 is 3.84)
  const chiPenalty = Math.min(50, chiSquare * 5);

  return Math.max(0, Math.round(entropyScore - chiPenalty * 0.2));
}
