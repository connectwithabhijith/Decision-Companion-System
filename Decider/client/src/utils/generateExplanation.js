/**
 * Generates a plain-language explanation of why the top-ranked option won.
 *
 * @param {Array<{ name, total, sPlus, sMinus }>} results  — sorted descending
 * @param {Array<{ name, type, weight }>} criteria
 * @param {string[]} options
 * @param {Array<Record<string, number>>} scores
 * @returns {{ summary: string, strengths: string[], weaknesses: string[], tradeoffs: string[] }}
 */
export function generateExplanation(results, criteria, options, scores) {
  if (!results || results.length === 0) return null;

  const winner = results[0];
  const runnerUp = results[1];
  const winnerIdx = options.findIndex((o) => o.trim() === winner.name);

  // Sort criteria by weight descending so we talk about important ones first
  const sortedCriteria = [...criteria].sort((a, b) => b.weight - a.weight);

  const strengths = [];
  const weaknesses = [];
  const tradeoffs = [];

  for (const c of sortedCriteria) {
    const winnerScore = scores[winnerIdx]?.[c.name] ?? 0;

    // Compare winner against every other option on this criterion
    const allScores = options.map((_, i) => ({
      name:
        results.find((r) => r.name === options[i]?.trim())?.name || options[i],
      score: scores[i]?.[c.name] ?? 0,
    }));

    const maxScore = Math.max(...allScores.map((s) => s.score));
    const minScore = Math.min(...allScores.map((s) => s.score));
    const avgScore =
      allScores.reduce((s, x) => s + x.score, 0) / allScores.length;
    const isTopScore = winnerScore === maxScore;
    const isLowScore = winnerScore === minScore;

    const weightLabel =
      c.weight >= 8
        ? "high-priority"
        : c.weight >= 5
          ? "moderately weighted"
          : "lower-priority";

    if (c.type === "benefit") {
      if (isTopScore && c.weight >= 5) {
        strengths.push(
          `Scored highest on **${c.name}** (${winnerScore}) among all options — a ${weightLabel} criterion (weight ${c.weight}).`,
        );
      } else if (winnerScore > avgScore && c.weight >= 5) {
        strengths.push(
          `Performed above average on **${c.name}** (${winnerScore} vs avg ${avgScore.toFixed(1)}), a ${weightLabel} factor.`,
        );
      } else if (isLowScore && c.weight >= 5) {
        weaknesses.push(
          `Scored lowest on **${c.name}** (${winnerScore}), a ${weightLabel} criterion — partially offset by stronger performance elsewhere.`,
        );
      }
    } else {
      // cost criterion — lower is better
      if (isTopScore && c.weight >= 5) {
        weaknesses.push(
          `Has the highest **${c.name}** (${winnerScore}), which is undesirable for a cost criterion (weight ${c.weight}).`,
        );
      } else if (isLowScore && c.weight >= 5) {
        strengths.push(
          `Has the lowest **${c.name}** (${winnerScore}) — optimal for this cost criterion (weight ${c.weight}).`,
        );
      }
    }
  }

  // Tradeoff: compare winner vs runner-up
  if (runnerUp) {
    const runnerUpIdx = options.findIndex((o) => o.trim() === runnerUp.name);
    for (const c of sortedCriteria.slice(0, 3)) {
      const wScore = scores[winnerIdx]?.[c.name] ?? 0;
      const rScore = scores[runnerUpIdx]?.[c.name] ?? 0;
      const diff = Math.abs(wScore - rScore);
      if (diff === 0) continue;

      const winnerIsBetter =
        c.type === "benefit" ? wScore > rScore : wScore < rScore;

      if (winnerIsBetter) {
        tradeoffs.push(
          `Edges out **${runnerUp.name}** on **${c.name}** (${wScore} vs ${rScore}).`,
        );
      } else {
        tradeoffs.push(
          `**${runnerUp.name}** beats it on **${c.name}** (${rScore} vs ${wScore}), but this was outweighed by other criteria.`,
        );
      }
    }
  }

  // Overall summary using TOPSIS distances
  const gapPct = runnerUp
    ? (((winner.total - runnerUp.total) / runnerUp.total) * 100).toFixed(1)
    : null;

  const summary = runnerUp
    ? `**${winner.name}** ranked #1 with a TOPSIS score of ${(winner.total * 100).toFixed(1)}/100, ` +
      `leading **${runnerUp.name}** by ${gapPct}%. ` +
      `It had the shortest distance to the ideal solution (S⁺ = ${winner.sPlus.toFixed(3)}) ` +
      `and the longest distance from the worst (S⁻ = ${winner.sMinus.toFixed(3)}).`
    : `**${winner.name}** ranked #1 with a TOPSIS score of ${(winner.total * 100).toFixed(1)}/100.`;

  return { summary, strengths, weaknesses, tradeoffs };
}
