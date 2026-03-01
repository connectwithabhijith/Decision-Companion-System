import WhatIfSandbox from "./WhatIfSandbox";
import { generateExplanation } from "../utils/generateExplanation";

// Renders **bold** markdown-style text inline
function InlineMarkdown({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="text-white font-semibold">{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function Results({ results, criteria, options, scores, onCommit }) {
  if (!results || results.length === 0) return null;

  const explanation = generateExplanation(results, criteria, options, scores);

  return (
    <div className="w-full max-w-2xl mt-10 animate-fadeIn">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Final Results
      </h2>

      {/* ── Ranked List ── */}
      <div className="space-y-4 mb-10">
        {results.map((res, i) => (
          <div
            key={i}
            className={`px-5 py-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg
              ${i === 0 ? "bg-yellow-400/20" : "bg-white/10"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold
                    ${i === 0 ? "bg-yellow-400 text-black"
                      : i === 1 ? "bg-gray-300 text-black"
                      : i === 2 ? "bg-orange-400 text-black"
                      : "bg-white/20 text-white"}`}
                >
                  {i + 1}
                </div>
                <span className="text-white text-lg font-medium">{res.name}</span>
              </div>
              <div className="text-right">
                <div className="text-indigo-300 font-bold text-lg">
                  {(res.total * 100).toFixed(1)}
                  <span className="text-xs text-white/40 font-normal ml-1">/ 100</span>
                </div>
                <div className="text-white/30 text-xs">TOPSIS score</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${i === 0 ? "bg-yellow-400" : "bg-indigo-400"}`}
                style={{ width: `${(res.total * 100).toFixed(1)}%` }}
              />
            </div>

            {/* S+ / S- distances */}
            {res.sPlus !== undefined && (
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-white/30">
                  S<sup>+</sup>{" "}
                  <span className="text-white/50">{res.sPlus.toFixed(3)}</span>
                  <span className="ml-1 text-white/20">dist. to ideal best</span>
                </span>
                <span className="text-xs text-white/30">
                  S<sup>−</sup>{" "}
                  <span className="text-white/50">{res.sMinus.toFixed(3)}</span>
                  <span className="ml-1 text-white/20">dist. to ideal worst</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Why This Recommendation? ── */}
      {explanation && (
        <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 space-y-5">
          <h3 className="text-xl font-bold text-white">Why this recommendation?</h3>

          {/* Summary */}
          <p className="text-sm text-white/70 leading-relaxed">
            <InlineMarkdown text={explanation.summary} />
          </p>

          {/* Strengths */}
          {explanation.strengths.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-green-400 mb-2">
                ✦ Strengths
              </p>
              <ul className="space-y-1.5">
                {explanation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">▲</span>
                    <InlineMarkdown text={s} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {explanation.weaknesses.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-red-400 mb-2">
                ✦ Weaknesses
              </p>
              <ul className="space-y-1.5">
                {explanation.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">▼</span>
                    <InlineMarkdown text={w} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tradeoffs vs runner-up */}
          {explanation.tradeoffs.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">
                ✦ vs #{results[1]?.name}
              </p>
              <ul className="space-y-1.5">
                {explanation.tradeoffs.map((t, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">◆</span>
                    <InlineMarkdown text={t} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-white/20 border-t border-white/10 pt-4">
            This explanation is generated deterministically from TOPSIS scores and raw inputs — not by an AI model.
          </p>
        </div>
      )}

      {/* ── What-If Sandbox ── */}
      <WhatIfSandbox
        criteria={criteria}
        options={options}
        scores={scores}
        onCommit={onCommit}
      />
    </div>
  );
}