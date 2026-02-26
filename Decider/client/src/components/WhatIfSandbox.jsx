import { useState, useMemo, useCallback } from "react";
import { evaluateDecision } from "../utils/evaluateDecision";

const COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#a855f7",
  "#ec4899", "#f59e0b", "#06b6d4", "#ef4444",
];

export default function WhatIfSandbox({ criteria, options, scores, onCommit }) {
  const [sandboxWeights, setSandboxWeights] = useState(() =>
    Object.fromEntries(criteria.map((c) => [c.name, c.weight]))
  );
  const [committed, setCommitted] = useState(() =>
    Object.fromEntries(criteria.map((c) => [c.name, c.weight]))
  );

  const sandboxCriteria = useMemo(
    () => criteria.map((c) => ({ ...c, weight: sandboxWeights[c.name] })),
    [criteria, sandboxWeights]
  );

  const baselineRanked = useMemo(
    () => evaluateDecision(criteria, options, scores),
    [criteria, options, scores]
  );

  const liveRanked = useMemo(
    () => evaluateDecision(sandboxCriteria, options, scores),
    [sandboxCriteria, options, scores]
  );

  const baselineRankMap = useMemo(() => {
    const m = {};
    baselineRanked.forEach((r, i) => { m[r.name] = i + 1; });
    return m;
  }, [baselineRanked]);

  const liveRankMap = useMemo(() => {
    const m = {};
    liveRanked.forEach((r, i) => { m[r.name] = i + 1; });
    return m;
  }, [liveRanked]);

  const isDirty = criteria.some((c) => sandboxWeights[c.name] !== committed[c.name]);
  const totalWeight = criteria.reduce((s, c) => s + sandboxWeights[c.name], 0);

  const handleSlider = useCallback((name, val) => {
    setSandboxWeights((prev) => ({ ...prev, [name]: Number(val) }));
  }, []);

  const handleReset = () => setSandboxWeights({ ...committed });
  const handleCommit = () => {
    setCommitted({ ...sandboxWeights });
    const updatedCriteria = criteria.map((c) => ({ ...c, weight: sandboxWeights[c.name] }));
    onCommit?.(updatedCriteria);
  };

  const biggestMover = liveRanked.reduce((best, r) => {
    const delta = Math.abs((liveRankMap[r.name] || 0) - (baselineRankMap[r.name] || 0));
    return delta > (best.delta || 0) ? { name: r.name, delta } : best;
  }, {});

  const maxScore = Math.max(...liveRanked.map((r) => r.total), 0.0001);

  // For slider gradient: map weight value 1–10 onto 0–100%
  const sliderFillPct = (val) => ((val - 1) / 9) * 100;

  // For distribution bar: each criterion's share of the total weight
  const weightSharePct = (name) =>
    totalWeight > 0 ? (sandboxWeights[name] / totalWeight) * 100 : 0;

  const rankBgColor = (rank) =>
    rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "#1e293b";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 mb-8 font-mono">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: isDirty ? "#22c55e" : "#334155",
                boxShadow: isDirty ? "0 0 8px #22c55e" : "none",
              }}
            />
            <span className="text-[10px] tracking-widest text-slate-500 uppercase">
              {isDirty ? "Sandbox Active — Changes Not Committed" : "Sandbox Idle"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">What-If Sandbox</h2>
          <p className="text-xs text-slate-500 mt-1">
            Adjust weights below — rankings update live. Commit when satisfied.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          Total weight: {totalWeight}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* ── Left: Sliders ── */}
        <div>
          <p className="text-[11px] tracking-widest text-slate-500 uppercase mb-4">
            Criteria Weights
          </p>

          <div className="flex flex-col gap-5">
            {criteria.map((c, i) => {
              const color = COLORS[i % COLORS.length];
              const val = sandboxWeights[c.name];
              const orig = committed[c.name];
              const changed = val !== orig;
              const fillPct = sliderFillPct(val);

              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-sm text-slate-300 font-medium">{c.name}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide border"
                        style={{
                          background: c.type === "benefit" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
                          color: c.type === "benefit" ? "#4ade80" : "#f87171",
                          borderColor: c.type === "benefit" ? "rgba(34,197,94,0.25)" : "rgba(248,113,113,0.25)",
                        }}
                      >
                        {c.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {changed && (
                        <span className="text-[10px] text-slate-500">was {orig}</span>
                      )}
                      <span
                        className="text-sm font-bold w-6 text-right transition-colors duration-200"
                        style={{ color: changed ? color : "#64748b" }}
                      >
                        {val}
                      </span>
                    </div>
                  </div>

                  {/* Slider — gradient fill maps 1–10 → 0–100% */}
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={val}
                    onChange={(e) => handleSlider(c.name, e.target.value)}
                    className="w-full h-1 rounded-sm outline-none cursor-pointer appearance-none"
                    style={{
                      background: `linear-gradient(to right, ${color} ${fillPct}%, #1e293b ${fillPct}%)`,
                      transition: "background 0.1s",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={handleReset}
              disabled={!isDirty}
              className="flex-1 py-2 rounded-lg border border-white/10 text-xs font-semibold transition-all duration-200"
              style={{
                color: isDirty ? "#94a3b8" : "#334155",
                cursor: isDirty ? "pointer" : "not-allowed",
              }}
            >
              ↺ Reset
            </button>
            <button
              onClick={handleCommit}
              disabled={!isDirty}
              className="flex-[2] py-2 rounded-lg text-xs font-bold transition-all duration-200 border"
              style={{
                background: isDirty ? "rgba(59,130,246,0.12)" : "transparent",
                borderColor: isDirty ? "rgba(59,130,246,0.4)" : "#1e293b",
                color: isDirty ? "#60a5fa" : "#334155",
                cursor: isDirty ? "pointer" : "not-allowed",
              }}
            >
              ✓ Commit Weights
            </button>
          </div>

          {/* Biggest Mover */}
          {isDirty && biggestMover?.delta > 0 && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="text-[10px] text-purple-400 tracking-widest uppercase mb-1">
                Biggest Mover
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-slate-100">{biggestMover.name}</strong>{" "}shifted{" "}
                <strong style={{
                  color: liveRankMap[biggestMover.name] < baselineRankMap[biggestMover.name]
                    ? "#22c55e" : "#f87171",
                }}>
                  {liveRankMap[biggestMover.name] < baselineRankMap[biggestMover.name]
                    ? `▲ up` : `▼ down`}{" "}
                  {biggestMover.delta} spot{biggestMover.delta > 1 ? "s" : ""}
                </strong>.
              </div>
            </div>
          )}

          {/* Weight Distribution Bar — width = proportional share of total */}
          <div className="mt-4">
            <div className="text-[10px] text-slate-700 uppercase tracking-widest mb-2">
              Distribution
            </div>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
              {criteria.map((c, i) => (
                <div
                  key={c.name}
                  title={`${c.name}: ${sandboxWeights[c.name]} (${weightSharePct(c.name).toFixed(0)}%)`}
                  className="h-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${weightSharePct(c.name)}%`,
                    background: COLORS[i % COLORS.length],
                    minWidth: sandboxWeights[c.name] > 0 ? 2 : 0,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {criteria.map((c, i) => (
                <span key={c.name} className="text-[10px] text-slate-500">
                  <span style={{ color: COLORS[i % COLORS.length] }}>●</span>{" "}
                  {c.name} {sandboxWeights[c.name]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Live Rankings ── */}
        <div>
          <p className="text-[11px] tracking-widest text-slate-500 uppercase mb-4">
            Live Rankings{" "}
            {isDirty && <span className="text-amber-400">● sandbox</span>}
          </p>

          <div className="flex flex-col gap-2">
            {liveRanked.map((result, idx) => {
              const liveRank = idx + 1;
              const baseRank = baselineRankMap[result.name] || liveRank;
              const delta = liveRank - baseRank;
              const isTop = liveRank === 1;
              const barPct = maxScore > 0 ? (result.total / maxScore) * 100 : 0;

              return (
                <div
                  key={result.name}
                  className="px-4 py-3 rounded-xl border transition-all duration-300"
                  style={{
                    background: isTop ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.02)",
                    borderColor: isTop ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Rank badge */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: rankBgColor(liveRank) }}
                    >
                      {liveRank}
                    </div>

                    <span className="flex-1 text-sm font-semibold text-slate-100">
                      {result.name}
                    </span>

                    <div className="text-right">
                      <div
                        className="text-base font-bold tabular-nums"
                        style={{ color: isTop ? "#60a5fa" : "#64748b" }}
                      >
                        {(result.total * 100).toFixed(1)}
                      </div>
                      {delta === 0 ? (
                        <span className="text-[10px] text-slate-700">—</span>
                      ) : (
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: delta < 0 ? "#22c55e" : "#f87171" }}
                        >
                          {delta < 0 ? `▲ ${Math.abs(delta)}` : `▼ ${delta}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score bar — relative to the top scorer */}
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barPct}%`,
                        background: isTop ? "#3b82f6" : "#334155",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {[["▲ N", "#22c55e", "Moved up"], ["▼ N", "#f87171", "Moved down"], ["—", "#475569", "No change"]].map(
              ([sym, col, label]) => (
                <span key={label} className="text-[10px] text-slate-500">
                  <strong style={{ color: col }}>{sym}</strong> {label}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
        input[type=range] { -webkit-appearance: none; appearance: none; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px;
          border-radius: 50%; background: #f1f5f9; cursor: pointer;
          border: 2px solid #0d1117; transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #f1f5f9; cursor: pointer; border: 2px solid #0d1117;
        }
      `}</style>
    </div>
  );
}