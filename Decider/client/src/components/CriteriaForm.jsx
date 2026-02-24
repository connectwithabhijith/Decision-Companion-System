import { useState, useEffect } from "react";

export default function CriteriaForm({ criteria, updateCriterion }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const current = criteria[visibleCount - 1];

    if (
      current &&
      current.name &&
      current.weight &&
      visibleCount < criteria.length
    ) {
      setVisibleCount((prev) => prev + 1);
    }
  }, [criteria, visibleCount]);

  return (
    <div className="flex justify-center animate-fadeIn mt-8">
      <div className="flex flex-wrap gap-6 max-w-8xl justify-center">
        {criteria.slice(0, visibleCount).map((c, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md border border-white/20 
          p-5 rounded-2xl shadow-lg w-72 flex flex-col gap-3"
          >
            <h4 className="text-lg font-semibold text-white">
              Criterion {i + 1}
            </h4>

            {/* Name */}
            <input
              type="text"
              value={c.name}
              placeholder="Enter criterion name..."
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white 
            border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => updateCriterion(i, "name", e.target.value)}
            />

            {/* Weight */}
            <input
              type="number"
              min="1"
              max="10"
              placeholder="1-10"
              value={c.weight}
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white 
            border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => updateCriterion(i, "weight", e.target.value)}
              onBlur={(e) => {
                let num = Number(e.target.value);
                if (!num) num = 1;
                num = Math.max(1, Math.min(10, num));
                updateCriterion(i, "weight", num);
              }}
            />

            {/* Type */}
            <select
              value={c.type}
              className="w-full px-3 py-2 rounded-lg bg-white/20 text-white 
            border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onChange={(e) => updateCriterion(i, "type", e.target.value)}
            >
              <option value="benefit" className="text-black">
                Benefit
              </option>
              <option value="cost" className="text-black">
                Cost
              </option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
