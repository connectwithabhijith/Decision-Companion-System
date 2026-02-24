export default function ScenarioInput({
  decisionInput,
  setDecisionInput,
  handleSmartSuggest,
  loading,
  error,
}) {
  return (
    <div className="flex justify-center mt-8 animate-fadeIn">
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 
    p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 w-full max-w-2xl"
      >
        {/* Heading */}
        <p className="text-xl text-center text-white font-semibold">
          Describe your decision <br />
          <span className="text-gray-300 text-sm font-normal">
            (e.g., Where should I travel within constraints?)
          </span>
        </p>

        {/* Input */}
        <input
          className="w-full px-4 py-3 rounded-lg bg-white/20 text-white 
        border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 
        placeholder:text-gray-300"
          placeholder="Describe your decision..."
          value={decisionInput}
          onChange={(e) => setDecisionInput(e.target.value)}
        />

        {/* Button */}
        <button
          className="w-full px-5 py-2.5 rounded-lg font-medium text-white 
        bg-emerald-700 hover:bg-emerald-800 transition duration-200 shadow-md hover:shadow-lg"
          onClick={handleSmartSuggest}
        >
          {loading ? "Generating..." : "Auto Generate"}
        </button>

        {/* Error */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
