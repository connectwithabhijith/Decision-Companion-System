# Decider — Decision Companion System

A generic, explainable decision-making tool that helps users evaluate and rank options across multiple criteria. Built to be flexible enough to handle any real-world decision — from choosing a laptop to selecting a job candidate.

---

## What It Does

The user defines their own decision context from scratch:

- Describe the decision and let AI suggest a starting set of criteria
- Edit, add, or remove any suggested criteria
- Assign scores to each option for every criterion
- Get a ranked result with a plain-language explanation of why the top option won
- Use the What-If Sandbox to adjust weights and see rankings update live

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| AI Model | Llama 3.3 70B via Groq API |
| Language | JavaScript (ES Modules) |

---

## System Architecture

```
User
 │
 ├──▶ Describes decision + criteria count
 │         │
 │         ▼
 │    Express Server  ──▶  Groq API (Llama 3.3)
 │         │                    │
 │         │◀── suggested criteria + weights ──┘
 │         │
 ▼
Frontend (React)
 │
 ├── User edits / accepts criteria
 ├── User enters scores for each option
 ├── evaluateDecision.js  →  TOPSIS algorithm (client-side)
 ├── generateExplanation.js  →  plain-language reasoning (client-side)
 └── WhatIfSandbox  →  live re-ranking on weight change
```

---

## How the Scoring Works

The system does **not** use AI to calculate results. All ranking logic runs
entirely on the client side using **TOPSIS** (Technique for Order of Preference
by Similarity to Ideal Solution) with vector normalization.

### Why TOPSIS?

A plain weighted sum has a hidden flaw — criteria with larger raw value ranges
dominate criteria with smaller ranges regardless of the weights assigned. TOPSIS
with vector normalization eliminates this bias.

### Steps

**1 — Vector Normalization**
Each criterion column is divided by its Euclidean norm (`√(Σ x²)`), scaling all
criteria onto a dimensionless comparable range.

**2 — Apply Weights**
Normalized values are multiplied by user-defined weights (1–10), applied after
the playing field is level.

**3 — Identify Ideal Solutions**
- **Ideal Best (A⁺)** — best value per criterion across all options
- **Ideal Worst (A⁻)** — worst value per criterion across all options

For `benefit` criteria, higher is better. For `cost` criteria, lower is better.

**4 — Euclidean Distance**
Each option is measured by:
- `S⁺` — distance to the ideal best (lower is better)
- `S⁻` — distance to the ideal worst (higher is better)

**5 — Closeness Coefficient**
```
C = S⁻ / (S⁺ + S⁻)
```
`C` ranges from 0 to 1. Options are ranked by `C` in descending order.

| Value   | Meaning                                     |
|---------|---------------------------------------------|
| Low S⁺  | Option is close to the ideal best — good    |
| High S⁻ | Option is far from the ideal worst — good   |
| High C  | Strong overall candidate                    |

---

## Role of AI

AI is used in **one place only** — to suggest an initial set of criteria and weights
when the user describes their decision. It plays no role in scoring, ranking, or explaining results.

| Part of the System        | AI Involved? |
|---------------------------|-------------|
| Criteria & weight suggestion | ✅ Yes — Groq/Llama suggests based on decision description |
| Score input               | ❌ No — entered manually by the user |
| Ranking calculation       | ❌ No — TOPSIS runs entirely client-side |
| Recommendation explanation | ❌ No — deterministic rule-based logic |

The user can accept, edit, or completely replace any AI-suggested criterion before
proceeding. The AI output is never used directly in any calculation.

### Backend — `POST /api/generate`

The Express server exposes a single endpoint:

```
POST /api/generate
Body:    { decisionText: string, count: number }
Returns: { criteria: [{ name: string, weight: number, type: "benefit" | "cost" }] }
```

The server sends the user's decision description and requested criterion count to
the Groq API. The response is validated, cleaned, and returned to the frontend.
The server applies no business logic beyond this.

**Model:** `llama-3.3-70b-versatile`  
**Temperature:** `0.2` — kept low for structured, consistent output

---

## Explainability

The system is designed to be fully transparent:

- **Criteria and weights** are set by the user (AI only suggests, never decides)
- **TOPSIS** is a published, well-documented algorithm with clear mathematical steps
- **S⁺ and S⁻ distances** are shown in the results so users can see exactly why an option ranked where it did
- **Recommendation explanation** is generated deterministically from scores and TOPSIS output — not by an AI model
- **What-If Sandbox** lets users test how sensitive the ranking is to weight changes before committing

---

## Project Structure

```
/
├── phase1/              # Original HTML + JS prototype — kept as-is for reference
├── Decider/
│   ├── client/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── CriteriaForm.jsx
│   │       │   ├── OptionsForm.jsx
│   │       │   ├── ScoreMatrix.jsx
│   │       │   ├── Results.jsx
│   │       │   ├── ScenarioInput.jsx
│   │       │   ├── SetupForm.jsx
│   │       │   └── WhatIfSandbox.jsx
│   │       ├── utils/
│   │       │   ├── evaluateDecision.js
│   │       │   └── generateExplanation.js
│   │       └── services/
│   │           └── api.js
│   └── server/
│       ├── index.js          # Express server + /api/generate route
│       ├── .env              # GROQ_API_KEY (gitignored)
│       └── package.json
├── Design_Diagram/
├── BUILD_PROCESS.md
├── RESEARCH_LOG.md
└── readme.md
```