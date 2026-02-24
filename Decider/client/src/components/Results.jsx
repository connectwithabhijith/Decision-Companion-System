import WhatIfSandbox from "./WhatIfSandbox";

export default function Results({ results, criteria, options, scores }) {
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
            className={`flex items-center justify-between px-5 py-4 rounded-xl 
            backdrop-blur-md border border-white/20 shadow-lg
            ${i === 0 ? "bg-yellow-400/20" : "bg-white/10 "}`}
          >
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
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

              {/* Option Name */}
              <span className="text-white text-lg font-medium">{res.name}</span>
            </div>

            {/* Score */}
            <div className="text-indigo-300 font-semibold text-lg">
              {res.total.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <WhatIfSandbox
        criteria={criteria} // same criteria array you already have
        options={options} // same options array
        scores={scores} // same scores array
      />
    </div>
  );
}
