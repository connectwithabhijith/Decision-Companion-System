export async function fetchCriteria(decisionText,count) {
  const response = await fetch("https://decider-xxxx.onrender.com/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ decisionText,count })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch criteria");
  }

  return response.json();
}
