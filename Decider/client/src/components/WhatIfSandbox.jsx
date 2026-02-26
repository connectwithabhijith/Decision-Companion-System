import { useState, useMemo, useCallback } from "react";
import { evaluateDecision } from "../utils/evaluateDecision";

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   criteria : [{ name: string, type: "benefit"|"cost", weight: number }, ...]
//   options  : [string, ...]
//   scores   : [{ [criterionName]: number }, ...]   (same index order as options)
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#ec4899","#f59e0b","#06b6d4","#ef4444"];

export default function WhatIfSandbox({ criteria, options, scores, onCommit }) {
  // sandboxWeights mirrors criteria weights but is editable without touching real data
  const [sandboxWeights, setSandboxWeights] = useState(() =>
    Object.fromEntries(criteria.map((c) => [c.name, c.weight]))
  );
  const [committed, setCommitted] = useState(() =>
    Object.fromEntries(criteria.map((c) => [c.name, c.weight]))
  );

  // Build sandbox criteria by swapping in sandbox weights
  const sandboxCriteria = useMemo(
    () => criteria.map((c) => ({ ...c, weight: sandboxWeights[c.name] })),
    [criteria, sandboxWeights]
  );

  // Evaluate with COMMITTED weights (baseline)
  const baselineRanked = useMemo(
    () => evaluateDecision(criteria, options, scores),
    [criteria, options, scores]
  );

  // Evaluate with SANDBOX weights (live)
  const liveRanked = useMemo(
    () => evaluateDecision(sandboxCriteria, options, scores),
    [sandboxCriteria, options, scores]
  );

  // rank maps: name → rank (1-based)
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

  // Biggest mover
  const biggestMover = liveRanked.reduce((best, r) => {
    const delta = Math.abs((liveRankMap[r.name] || 0) - (baselineRankMap[r.name] || 0));
    return delta > (best.delta || 0) ? { name: r.name, delta } : best;
  }, {});

  const maxScore = Math.max(...liveRanked.map((r) => r.total), 0.0001);

  return (
    <div style={{
      background: "#0d1117", borderRadius: 14, padding: 24, marginBottom:35,
      border: "1px solid #1e293b", fontFamily: "'DM Mono', 'Fira Code', monospace",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: isDirty ? "#22c55e" : "#334155",
              boxShadow: isDirty ? "0 0 8px #22c55e" : "none",
              transition: "all 0.3s",
            }} />
            <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase" }}>
              {isDirty ? "Sandbox Active — Changes Not Committed" : "Sandbox Idle"}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
            What-If Sandbox
          </h2>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 12 }}>
            Adjust weights below — rankings update live. Commit when satisfied.
          </p>
        </div>
        <span style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
          background: "rgba(99,102,241,0.12)",
          color: "#818cf8",
          border: "1px solid rgba(99,102,241,0.3)",
        }}>
          Total weight: {totalWeight}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* ── Left: Sliders ── */}
        <div>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Criteria Weights
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {criteria.map((c, i) => {
              const color = COLORS[i % COLORS.length];
              const val = sandboxWeights[c.name];
              const orig = committed[c.name];
              const changed = val !== orig;
              return (
                <div key={c.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>{c.name}</span>
                      {/* Shows benefit/cost type from your criteria */}
                      <span style={{
                        fontSize: 9, padding: "1px 5px", borderRadius: 4,
                        background: c.type === "benefit" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
                        color: c.type === "benefit" ? "#4ade80" : "#f87171",
                        border: `1px solid ${c.type === "benefit" ? "rgba(34,197,94,0.25)" : "rgba(248,113,113,0.25)"}`,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {c.type}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {changed && <span style={{ fontSize: 10, color: "#64748b" }}>was {orig}</span>}
                      <span style={{
                        fontSize: 14, fontWeight: 700, minWidth: 36, textAlign: "right",
                        color: changed ? color : "#64748b", transition: "color 0.2s",
                      }}>
                        {val}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range" min={1} max={10} value={val}
                    onChange={(e) => handleSlider(c.name, e.target.value)}
                    style={{
                      width: "100%", appearance: "none", height: 4,
                      borderRadius: 2, outline: "none", cursor: "pointer",
                      background: `linear-gradient(to right, ${color} ${val}%, #1e293b ${val}%)`,
                      transition: "background 0.1s",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={handleReset} disabled={!isDirty} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #1e293b",
              background: "transparent", color: isDirty ? "#94a3b8" : "#334155",
              cursor: isDirty ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 600,
              fontFamily: "inherit", transition: "all 0.2s",
            }}>
              ↺ Reset
            </button>
            <button onClick={handleCommit} disabled={!isDirty} style={{
              flex: 2, padding: "9px 0", borderRadius: 8,
              border: isDirty ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1e293b",
              background: isDirty ? "rgba(59,130,246,0.12)" : "transparent",
              color: isDirty ? "#60a5fa" : "#334155",
              cursor: isDirty ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700,
              fontFamily: "inherit", transition: "all 0.2s",
            }}>
              ✓ Commit Weights
            </button>
          </div>

          {/* Biggest mover */}
          {isDirty && biggestMover?.delta > 0 && (
            <div style={{
              marginTop: 14, padding: "11px 14px", borderRadius: 8,
              background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)",
            }}>
              <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                Biggest Mover
              </div>
              <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                <strong style={{ color: "#e2e8f0" }}>{biggestMover.name}</strong>{" "}
                shifted{" "}
                <strong style={{ color: liveRankMap[biggestMover.name] < baselineRankMap[biggestMover.name] ? "#22c55e" : "#f87171" }}>
                  {liveRankMap[biggestMover.name] < baselineRankMap[biggestMover.name] ? "▲ up" : "▼ down"} {biggestMover.delta} spot{biggestMover.delta > 1 ? "s" : ""}
                </strong>.
              </div>
            </div>
          )}

          {/* Weight distribution bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: "#334155", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Distribution
            </div>
            <div style={{ display: "flex", height: 8, borderRadius: 5, overflow: "hidden", gap: 2 }}>
              {criteria.map((c, i) => (
                <div key={c.name}
                  style={{ width: `${sandboxWeights[c.name]}%`, background: COLORS[i % COLORS.length], transition: "width 0.3s ease" }}
                  title={`${c.name}: ${sandboxWeights[c.name]}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Live Rankings ── */}
        <div>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Live Rankings {isDirty && <span style={{ color: "#f59e0b" }}>● sandbox</span>}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {liveRanked.map((result, idx) => {
              const liveRank = idx + 1;
              const baseRank = baselineRankMap[result.name] || liveRank;
              const delta = liveRank - baseRank;
              const isTop = liveRank === 1;
              const barPct = maxScore > 0 ? (result.total / maxScore) * 100 : 0;

              return (
                <div key={result.name} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: isTop ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.02)",
                  border: isTop ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.35s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: ["#f59e0b","#94a3b8","#b45309"][liveRank - 1] || "#1e293b",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "#fff",
                    }}>
                      {liveRank}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
                      {result.name}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      {/* score × 100 to match your normalized 0–1 range → display as 0–100 */}
                      <div style={{ fontSize: 16, fontWeight: 700, color: isTop ? "#60a5fa" : "#64748b", fontVariantNumeric: "tabular-nums" }}>
                        {(result.total * 100).toFixed(1)}
                      </div>
                      {delta === 0
                        ? <span style={{ fontSize: 10, color: "#334155" }}>—</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, color: delta < 0 ? "#22c55e" : "#f87171" }}>
                            {delta < 0 ? `▲ ${Math.abs(delta)}` : `▼ ${delta}`}
                          </span>
                      }
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "#1e293b", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2, width: `${barPct}%`,
                      background: isTop ? "#3b82f6" : "#334155",
                      transition: "width 0.4s ease, background 0.3s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[["▲ N","#22c55e","Moved up"],["▼ N","#f87171","Moved down"],["—","#475569","No change"]].map(([sym, col, label]) => (
              <span key={label} style={{ fontSize: 10, color: "#475569" }}>
                <strong style={{ color: col }}>{sym}</strong> {label}
              </span>
            ))}
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