export function evaluateDecision(criteria, options, scores) {
  let results = [];

  for (let i = 0; i < options.length; i++) {
    let totalScore = 0;

    for (let criterion of criteria) {

      let values = options.map((_, index) =>
        scores[index]?.[criterion.name] || 0
      );

      let max = Math.max(...values);
      let min = Math.min(...values);

      let value = scores[i]?.[criterion.name] || 0;
      let normalized = 0;

      if (max !== min) {
        if (criterion.type === "benefit") {
          normalized = (value - min) / (max - min);
        } else {
          normalized = (max - value) / (max - min);
        }
      }

      totalScore += normalized * criterion.weight;
    }

    results.push({
      name: options[i]?.trim() || `Option ${i + 1}`,
      total: totalScore,
    });
  }

  results.sort((a, b) => b.total - a.total);
  return results;
}