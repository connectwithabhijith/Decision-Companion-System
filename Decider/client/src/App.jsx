import { useState } from "react";
import SetupForm from "./components/SetupForm";
import CriteriaForm from "./components/CriteriaForm";
import OptionsForm from "./components/OptionsForm";
import ScoreMatrix from "./components/ScoreMatrix";
import Results from "./components/Results";
import { evaluateDecision } from "./utils/evaluateDecision";
import ScenarioInput from "./components/ScenarioInput";
import { fetchCriteria } from "./services/api";

export default function App() {
  const [criteriaCount, setCriteriaCount] = useState(0);
  const [optionCount, setOptionCount] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [options, setOptions] = useState([]);
  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [decisionInput, setDecisionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMatrix, setShowMatrix] = useState(false);

  const [hasGenerated, setHasGenerated] = useState(false);

  function generateStructure() {
    setCriteria(
      Array.from({ length: criteriaCount }, () => ({
        name: "",
        weight: 0,
        type: "benefit",
      })),
    );

    setOptions(Array.from({ length: optionCount }, () => ""));

    setResults([]);
    setHasGenerated(true);
  }

  function updateCriterion(index, field, value) {
    const updated = [...criteria];
    updated[index][field] = field === "weight" ? parseFloat(value) : value;
    setCriteria(updated);
  }

  function updateOption(index, value) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  function updateScore(optionIndex, criterion, value) {
    setScores((prev) => ({
      ...prev,
      [optionIndex]: {
        ...prev[optionIndex],
        [criterion]: parseFloat(value),
      },
    }));
  }

  function handleEvaluate() {
    const ranked = evaluateDecision(criteria, options, scores);
    setResults(ranked);
  }

  async function handleSmartSuggest() {
    if (!decisionInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCriteria(decisionInput, criteriaCount);

      if (!data.criteria) {
        throw new Error("Invalid AI response");
      }

      setCriteria(data.criteria);
      setOptions(Array.from({ length: optionCount }, () => ""));
      setResults([]);
      setHasGenerated(true);
    } catch (err) {
      setError("AI failed. Please enter manually.");
    }

    setLoading(false);
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center px-5 transition-all duration-700
      bg-gradient-to-r from-gray-900 via-slate-800 to-teal-900 bg-[length:200%_200%] animate-gradient
      ${hasGenerated ? "justify-start pt-10" : "justify-center"}
      `}
    >
      <h1 className="text-5xl font-extrabold text-slate-50 tracking-tight text-center mb-8">
        Decision Companion System
      </h1>

      <SetupForm
        setCriteriaCount={setCriteriaCount}
        setOptionCount={setOptionCount}
        generateStructure={generateStructure}
      />

      <ScenarioInput
        decisionInput={decisionInput}
        setDecisionInput={setDecisionInput}
        handleSmartSuggest={handleSmartSuggest}
        loading={loading}
        error={error}
      />

      {criteria.length > 0 && (
        <CriteriaForm criteria={criteria} updateCriterion={updateCriterion} />
      )}

      {options.length > 0 && (
        <ScoreMatrix
          criteria={criteria}
          options={options}
          updateOption={updateOption} // ✅ added
          updateScore={updateScore}
        />
      )}

      {options.length > 0 && (
        <div className="flex justify-center mt-6 mb-6">
          <button
            className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-slate-900 hover:shadow-lg transition duration-200"
            onClick={handleEvaluate}
          >
            Evaluate
          </button>
        </div>
      )}

      <Results results={results} />
    </div>
  );
}
