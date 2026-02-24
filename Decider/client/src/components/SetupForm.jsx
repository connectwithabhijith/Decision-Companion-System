export default function SetupForm({
  setCriteriaCount,
  setOptionCount,
  generateStructure,
}) {
  return (
    <div className="flex justify-center mt-6 animate-fadeIn">
      <div
        className="bg-white/10 backdrop-blur-md border border-white/20 
      p-6 rounded-2xl shadow-lg flex flex-wrap items-center gap-4"
      >
        {/* Criteria Input */}
        <input
          type="number"
          placeholder="Number of criteria"
          className="w-48 px-3 py-2 rounded-lg bg-white/20 text-white 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setCriteriaCount(parseInt(e.target.value))}
        />

        {/* Options Input */}
        <input
          type="number"
          placeholder="Number of options"
          className="w-48 px-3 py-2 rounded-lg bg-white/20 text-white 
          border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setOptionCount(parseInt(e.target.value))}
        />

        {/* Button */}
        <button
          className="px-5 py-2.5 rounded-lg font-medium text-white 
          bg-emerald-700 hover:bg-emerald-800 
          transition duration-200 shadow-md hover:shadow-lg"
          onClick={generateStructure}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
