import WhatIfSandbox from "./WhatIfSandbox";

export default function Results({
  results,
  criteria,
  options,
  scores,
  onCommit,
}) {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-10 animate-fadeIn">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        Final Results
      </h2>

      <div className="space-y-4 mb-10">
        {results.map((res, i) => (
          <div
            key={i}
            className={`px-5 py-4 rounded-xl backdrop-blur-md border border-white/20 shadow-lg
              ${i === 0 ? "bg-yellow-400/20" : "bg-white/10"}`}
          >
            <div className="flex items-center justify-between mb-2">
              {/* Left: rank badge + name */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold
                    ${
                      i === 0
                        ? "bg-yellow-400 text-black"
                        : i === 1
                          ? "bg-gray-300 text-black"
                          : i === 2
                            ? "bg-orange-400 text-black"
                            : "bg-white/20 text-white"
                    }`}
                >
                  {i + 1}
                </div>
                <span className="text-white text-lg font-medium">
                  {res.name}
                </span>
              </div>

              {/* Right: TOPSIS score */}
              <div className="text-right">
                <div className="text-indigo-300 font-bold text-lg">
                  {(res.total * 100).toFixed(1)}
                  <span className="text-xs text-white/40 font-normal ml-1">
                    / 100
                  </span>
                </div>
                <div className="text-white/30 text-xs">TOPSIS score</div>
              </div>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${i === 0 ? "bg-yellow-400" : "bg-indigo-400"}`}
                style={{ width: `${(res.total * 100).toFixed(1)}%` }}
              />
            </div>

            {/* S+ and S- distances — helpful for understanding TOPSIS */}
            {res.sPlus !== undefined && (
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-white/30">
                  S<span className="align-super text-[10px]">+</span>{" "}
                  <span className="text-white/50">{res.sPlus.toFixed(3)}</span>
                  <span className="ml-1 text-white/20">
                    dist. to ideal best
                  </span>
                </span>
                <span className="text-xs text-white/30">
                  S<span className="align-super text-[10px]">−</span>{" "}
                  <span className="text-white/50">{res.sMinus.toFixed(3)}</span>
                  <span className="ml-1 text-white/20">
                    dist. to ideal worst
                  </span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <WhatIfSandbox
        criteria={criteria}
        options={options}
        scores={scores}
        onCommit={onCommit}
      />
    </div>
  );
}
