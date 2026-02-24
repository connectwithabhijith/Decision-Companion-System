export async function fetchCriteria(decisionText,count) {
  const response = await fetch("http://localhost:5000/api/generate", {
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
