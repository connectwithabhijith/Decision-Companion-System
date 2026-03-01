import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/api/generate", async (req, res) => {
  try {
    const { decisionText, count } = req.body;

    const criteriaCount = Number(count);

    if (!decisionText) {
      return res.status(400).json({ error: "No decision text provided" });
    }

    if (isNaN(criteriaCount) || criteriaCount <= 0) {
      return res.status(400).json({ error: "Invalid criteria count" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a structured decision analysis assistant.",
        },
        {
          role: "user",
          content: `
Generate exactly ${criteriaCount} evaluation criteria for:

"${decisionText}"

Return strictly valid JSON in this format:

{
  "criteria": [
    { "name": "", "weight": number (1-10), "type": "benefit" or "cost" }
  ]
}

The array MUST contain exactly ${criteriaCount} items.
Do not include explanations.
Do not include markdown.
`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    const cleaned = content.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Error:", cleaned);
      return res.status(500).json({ error: "Invalid AI JSON format" });
    }

    // Validate structure
    if (!parsed.criteria || !Array.isArray(parsed.criteria)) {
      return res.status(500).json({ error: "Invalid criteria structure" });
    }

    // Enforce exact count safely
    parsed.criteria = parsed.criteria.slice(0, criteriaCount);

    res.json(parsed);
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Groq generation failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
