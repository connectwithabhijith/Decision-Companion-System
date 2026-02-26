/**
 * TOPSIS Decision Evaluation
 * (Technique for Order of Preference by Similarity to Ideal Solution)
 *
 * Steps:
 *  1. Build raw decision matrix
 *  2. Vector-normalize each column  →  r_ij = x_ij / sqrt(Σ x_ij²)
 *  3. Apply weights               →  v_ij = w_j * r_ij
 *  4. Find Ideal Best (A+) and Ideal Worst (A−) per criterion
 *  5. Compute Euclidean distances  S+ and S− for every option
 *  6. Compute closeness score      C_i = S−_i / (S+_i + S−_i)
 *  7. Sort descending by C_i
 *
 * @param {Array<{ name: string, type: "benefit"|"cost", weight: number }>} criteria
 * @param {string[]} options
 * @param {Array<Record<string, number>>} scores  — same index order as options
 * @returns {Array<{ name: string, total: number, sPlus: number, sMinus: number }>}
 */
export function evaluateDecision(criteria, options, scores) {
  const n = options.length;       // number of options
  const m = criteria.length;      // number of criteria

  if (n === 0 || m === 0) return [];

  // ── Clamp weights to [1, 10] (defensive, matches your input scale) ──────────
  const weights = criteria.map((c) => Math.max(1, Math.min(10, Number(c.weight) || 1)));

  // ── Step 1: Raw decision matrix  [n × m] ────────────────────────────────────
  // matrix[i][j] = raw score of option i on criterion j
  const matrix = options.map((_, i) =>
    criteria.map((c) => Number(scores[i]?.[c.name]) || 0)
  );

  // ── Step 2: Vector normalization ─────────────────────────────────────────────
  // For each criterion j, divide every value by the column's Euclidean norm.
  // norm_j = sqrt( Σ_i  x_ij² )
  const norms = criteria.map((_, j) => {
    const sumOfSquares = matrix.reduce((acc, row) => acc + row[j] ** 2, 0);
    return Math.sqrt(sumOfSquares) || 1; // guard against all-zero column
  });

  // r[i][j] = x_ij / norm_j
  const r = matrix.map((row) =>
    row.map((val, j) => val / norms[j])
  );

  // ── Step 3: Weighted normalized matrix ───────────────────────────────────────
  // v[i][j] = w_j * r[i][j]
  const v = r.map((row) =>
    row.map((val, j) => weights[j] * val)
  );

  // ── Step 4: Ideal Best (A+) and Ideal Worst (A−) ────────────────────────────
  // For a "benefit" criterion: A+_j = max column value, A−_j = min column value
  // For a "cost"    criterion: A+_j = min column value, A−_j = max column value
  const aPlus  = criteria.map((c, j) => {
    const col = v.map((row) => row[j]);
    return c.type === "benefit" ? Math.max(...col) : Math.min(...col);
  });

  const aMinus = criteria.map((c, j) => {
    const col = v.map((row) => row[j]);
    return c.type === "benefit" ? Math.min(...col) : Math.max(...col);
  });

  // ── Steps 5 & 6: Separation distances and closeness score ───────────────────
  const results = options.map((name, i) => {
    // S+_i = Euclidean distance from option i to Ideal Best
    const sPlus = Math.sqrt(
      criteria.reduce((acc, _, j) => acc + (v[i][j] - aPlus[j]) ** 2, 0)
    );

    // S−_i = Euclidean distance from option i to Ideal Worst
    const sMinus = Math.sqrt(
      criteria.reduce((acc, _, j) => acc + (v[i][j] - aMinus[j]) ** 2, 0)
    );

    // C_i ∈ [0, 1] — closer to 1 means closer to ideal best
    const total = (sPlus + sMinus) === 0 ? 0 : sMinus / (sPlus + sMinus);

    return {
      name: name?.trim() || `Option ${i + 1}`,
      total,       // TOPSIS closeness coefficient (replaces old totalScore)
      sPlus,       // distance to ideal best  (smaller = better)
      sMinus,      // distance to ideal worst (larger  = better)
    };
  });

  // ── Step 7: Sort descending ──────────────────────────────────────────────────
  results.sort((a, b) => b.total - a.total);
  return results;
}