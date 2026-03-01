export default function ScoreMatrix({
  criteria,
  options,
  updateOption,
  updateScore,
}) {
  if (criteria.length === 0 || options.length === 0) return null;

  return (
    <div className="w-3/5 max-w-3xl mt-8 space-y-6 animate-fadeIn">
      <h3 className="text-2xl font-bold text-white text-center">
        Score Matrix
      </h3>

      {options.map((opt, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-lg space-y-4"
        >
          {/* 🔥 OPTION NAME INPUT */}
          <input
            type="text"
            value={opt}
            placeholder={`Option ${i + 1}`}
            className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 
            focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onChange={(e) => updateOption(i, e.target.value)}
          />

          {/* 🔥 CRITERIA SCORES */}
          <div className="space-y-3">
            {criteria.map((c, j) => (
              <div key={j} className="flex items-center justify-between">
                <span className="text-gray-200">
                  {c.name || `Criterion ${j + 1}`}
                </span>

                <input
                  type="number"
                  className="w-20 px-2 py-1 rounded-lg bg-white/20 text-white border border-white/30 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center"
                  onChange={(e) => updateScore(i, c.name, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
