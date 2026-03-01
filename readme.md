# Decider — Decision Companion System

🔗 **Live Demo:** [decider.vercel.app](https://decision-companion-system-kappa.vercel.app/)

---

## Understanding the Problem

The core challenge was not technical — it was conceptual. Most decision tools are
built for a specific use case (compare these laptops, rank these candidates). The
brief asked for something generic: a system that works for *any* decision a user
brings to it, without knowing in advance what that decision is.

This meant the system could not have hardcoded criteria, hardcoded options, or
hardcoded scoring scales. Everything had to be defined by the user at runtime.

The second challenge was fairness. A naive weighted sum sounds reasonable until
you realise that a criterion scored on a 0–10,000 scale will always dominate one
scored on a 0–10 scale, regardless of the weights assigned. The algorithm had to
be scale-independent.

The third challenge was explainability. A ranked list with no reasoning is just
a black box. The system needed to tell the user *why* a particular option came
out on top — and that explanation had to come from the data, not from an AI
making something up.

---

## Assumptions Made

- The user knows their options before starting — the system helps them evaluate,
  not discover, alternatives
- Criteria weights on a 1–10 scale are intuitive enough for non-technical users
- Every criterion is either a **benefit** (higher is better) or a **cost** (lower
  is better) — no neutral criteria
- A minimum of 2 options is required for ranking to be meaningful
- The AI suggestion for criteria is a starting point only — the user is expected
  to review and edit before proceeding
- Users may not know what criteria to use, which is why AI assistance is offered
  at the start rather than forcing full manual entry

---

## Why the Solution Is Structured This Way

### Generic by design
The system takes the number of options and criteria as inputs before anything
else is rendered. This means no part of the UI assumes what kind of decision is
being made. The same interface works for choosing a laptop, hiring a candidate,
or picking a travel destination.

### Client-server split with a clear boundary
All scoring, ranking, and explanation logic runs entirely on the client side.
The server exists for one purpose only — to call the Groq API and return
AI-suggested criteria. This separation means the core decision logic is
transparent, testable, and works even if the server is down (users can enter
criteria manually).

### Progressive reveal
The UI reveals sections in order — scenario input, then criteria, then options,
then the score matrix, then results. This prevents users from being overwhelmed
and ensures each step is completed before the next is shown.

### AI as assistant, not decision-maker
The AI suggests criteria and initial weights based on the user's description.
It plays no role in scoring, ranking, or explaining results. This was a
deliberate design decision to keep the system explainable and the user in control.

---

## Design Decisions and Trade-offs

### TOPSIS over plain weighted sum
A weighted sum is simpler to implement and explain, but it breaks when criteria
have different raw scales. TOPSIS with vector normalization handles any scale
fairly. The trade-off is complexity — TOPSIS is harder to explain to a non-technical
user, which is why the results screen shows plain-language reasoning alongside
the raw S⁺ and S⁻ distances.

### Min-Max normalization was tried first and discarded
The first real normalization attempt used Min-Max (`value - min / max - min`).
This worked well with multiple options but had a critical flaw with only 2 options —
one always scored 1 and the other always scored 0, making the result feel arbitrary.
Vector normalization does not have this problem.

### Groq over OpenAI
The Groq API is OpenAI-compatible, so the same SDK is used — just pointed at a
different base URL. Groq was chosen for faster inference. The model used is
`llama-3.3-70b-versatile` at `temperature: 0.2` to keep output structured
and consistent rather than creative.

### User-defined score range
Initially the score inputs were hardcoded to 1–10. This was changed so users
can define their own range before scoring begins. This allows raw real-world
values (actual prices, actual benchmark scores) to be used instead of forcing
everything onto an arbitrary scale.

### What-If Sandbox as non-destructive exploration
The sandbox never modifies the committed weights until the user explicitly clicks
Commit. This was important because users need to feel safe experimenting — if
every slider drag immediately changed the results, it would feel unstable and
untrustworthy.

---

## Edge Cases Considered

| Edge Case | How it is handled |
|-----------|------------------|
| Only 2 options | Vector normalization handles this correctly; Min-Max was discarded partly for this reason |
| All options score identically on a criterion | The Euclidean norm of that column becomes 0 — guarded with `\|\| 1` to avoid division by zero |
| All options have equal TOPSIS scores | C = 0 for all; ranking is technically a tie — listed in known limitations |
| AI returns more criteria than requested | Server slices to the requested count with `.slice(0, criteriaCount)` |
| AI returns malformed JSON | Server catches parse errors and returns 500; frontend falls back to manual entry |
| User sets a weight of 0 | Treated as no influence on that criterion — valid input, not blocked |
| Score range where min equals max | Would produce division by zero in normalization — the `\|\| 1` guard handles this |
| Missing score for an option/criterion | Defaults to 0 via `scores[i]?.[c.name] \|\| 0` |

---

## How to Run the Project

### Prerequisites
- Node.js v18 or higher
- A Groq API key from [console.groq.com](https://console.groq.com)

### Backend

```bash
cd Decider/server
npm install
```

Create a `.env` file in the `server/` folder:

```
GROQ_API_KEY=your_api_key_here
```

Start the server:

```bash
node index.js
# Server running on port 5000
```

### Frontend

```bash
cd Decider/client
npm install
npm run dev
# App running on http://localhost:5173
```

---

## What I Would Improve With More Time

**Sensitivity analysis**
Show how much a weight needs to change before the top-ranked option is overtaken.
This would give users a quantitative sense of how robust their decision is —
"Option A stays #1 unless you increase Price weight above 7."


**Decision history**
Save past decisions locally so users can revisit them, compare how their
thinking evolved, or see whether the outcome they chose actually worked out.

**Multi-stakeholder mode**
Let multiple people score the same options independently, then aggregate and
highlight where opinions diverge most. Useful for team decisions where consensus
matters.

**Export to PDF**
Allow users to download a summary report of the decision — criteria, scores,
ranking, and explanation — for documentation or sharing with others.

**Improve UI**
Would have improved the ui to be more compatible in different systems.Currently only configured for desktop.
Works in any device but ui might not be having that flexibility in some devices.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| AI Model | Llama 3.3 70B via Groq API |
| Language | JavaScript (ES Modules) |

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
│       ├── index.js
│       ├── .env
│       └── package.json
├── Design_Diagram/
├── BUILD_PROCESS.md
├── RESEARCH_LOG.md
└── readme.md
```