// export default function OptionsForm({
//   options,
//   updateOption,
// }) {
//   return (
//     <div className="animate-fadeIn">
//       {options.map((opt, i) => (
//         <div key={i}>
//           <h4>Option {i + 1}</h4>
//           <input
//             placeholder="Option Name"
//             onChange={(e) =>
//               updateOption(i, e.target.value)
//             }
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

export default function OptionsForm({
  options,
  updateOption,
}) {
  return (
    <div className="animate-fadeIn w-full max-w-xl mt-6 space-y-4">
      {options.map((opt, i) => (
        <div
          key={i}
          className="border-2 border-slate-600 backdrop-blur-md p-4 rounded-xl shadow-md"
        >
          <h4 className="text-lg font-semibold text-slate-500 mb-2">
            Option {i + 1}
          </h4>

          <input
            type="text"
            value={opt} // ✅ FIXED
            placeholder="Enter option name..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) =>
              updateOption(i, e.target.value)
            }
          />
        </div>
      ))}
    </div>
  );
}
