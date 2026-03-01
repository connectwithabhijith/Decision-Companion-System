# RESEARCH LOG

A chronological record of every research query, prompt, and resource consulted
during the development of the Decision Companion System.

---

## Phase 1 — Initial Research & Concept

### General Learning
- **YouTube:** "How to write a markdown file"
- **React Playlist:** [React Full Course](https://youtu.be/vz1RlUyrc3w?si=dAi3FJAMPw6ad9SH)

### AI Prompts (ChatGPT)

**Understanding the problem:**
> "I have been given a project to develop by a company which I got selected for by passing a programming test. I want your help in solving it."
- The full project question was pasted in for context.

**Clarifying how scores work for non-trivial criteria:**
> "For a laptop, the options which can be given are the ones you already mentioned — so in the case of performance and brand reliability, what can be the numerical values provided? Should that be provided by the user or should be found?"

**Handling multiple decision types:**
> "How do we solve it for different scenarios? Like choosing a laptop is different from choosing a candidate for a particular role, which is different from choosing where to travel with particular constraints."

> "I am confused about how do you take the input for different cases."

> "How do I load the different criteria for each case? I cannot predefine it right?"

> "Or should I get the criteria for each case through an API call?"

**Understanding weighted scoring:**
> "After finding the sum, how should I sort or choose them?"

> "How will I get the cost-effective laptop — should the weights be lower or greater?"

> "I think to get the laptop with the lowest price we should give min value to price weight, because if all other values of criteria are same for different options then the laptop with the highest price will have the highest sum and the lowest weight will be cost effective — right?"

**Understanding benefit vs cost:**
> "How does the type (cost or benefit) impact?"

> "Suppose if there are 4 criteria and price has cost, performance has benefit, and battery and company also have benefit — how should the order of evaluating the final score be like?"

**Frontend design decisions:**
> "Give me an outline of how the frontend should be designed?"

> "I think I should use simple HTML, CSS and JavaScript — also it should be generic and takes in different inputs for different scenarios."

**Starting point:**
> "Yes now I understood it. What should I do first? From where should I begin?"

> "Give the logic code for the sample."

> "So I should take the number of criteria and also number of inputs and then create inputs for the number of options with number of criteria?"

---

## Phase 1 — HTML + JavaScript Implementation

### AI Prompts (ChatGPT)

**Building the input flow:**
> "1. Read counts 2. Clear previous sections 3. Create criteria inputs 4. Create option inputs — how to do this?"

> "Is name, weight and type a string?"

> "How do you normally put a string inside an HTML file?"

> "Is this actually taking all the values of the options?"

---

## Phase 2 — Migration to React

### AI Prompts (ChatGPT)

**Migrating the codebase:**
> "I have developed the project with HTML and JavaScript. I would like to convert it to React."

> "Can you make it into different components?"

**UI and styling issues:**
> "Same issue of Tailwind suggestion in new project."

> "How to increase thickness."

> "Also a beautiful button classname."

> "I want some gap between the 2 inputs and also the buttons."

> "Can I put an animated background image to this website?"

> "Give better heading design — no animation but a good font."

> "How to bring this button to center and also change the color?"

**Form behaviour:**
> "This criteria form is called all at once — I want to call it such that one comes after entering the details of the previous ones."

> "Each one of them should be aligned vertically inside the box and all the boxes aligned horizontally across the page."

---

## Phase 2 — AI-Assisted Criteria Generation

### Concept
> "So I have this idea — instead of manually entering the criteria, I should insert an input tag and give the input like 'should I go for a trip' and use an API call to get the criteria and appropriate weights for them and let it automatically be filled, and then if I need I can also change it from the display."

> "I choose using API call and also if it fails users have the option to enter the criteria manually."

> "Also now there is no input box for the user to enter their scenario. I also want to add that — the input may be like 'should I go for a trip' or 'which laptop should I choose' and from them the AI should automatically choose the criteria and appropriate weight and type."

### Implementation Prompts (ChatGPT)

> "Give the next steps to implement."

> "Give the folder structure."

> "Is this another file — ScenarioInput.jsx?"

> "Uncaught ReferenceError: handleSmartSuggest is not defined."

> "How should I do this — I also want a backend."

> "I am going to use Groq API."

> "https://console.groq.com/home — this is the URL of the site. Is it important to change in code?"

> "Where should this file be placed?"

> "How to check using Postman?"

> "Should API key be placed inside inverted commas?"

> "Yes it worked."

> "Now where should I make changes and what are the changes to be made?"

### Debugging the API Integration

> "I don't have progressive criteria form."

> "What is progressive reveal?"

> "In the output it generates 6 outputs instead of the value I gave as input."

> "AI failed. Please enter manually."  
> "No error in backend."  
> "No data got printed."

> `{ "error": "Invalid criteria count" }` — Postman showed this error.

> "Yeah now it worked in Postman."

> "Yeah this was the issue."

**UI fixes during this phase:**
> "I want to increase the size of this box horizontally without increasing the padding."

> "The contents of placeholder is not visible fully."

> "Is there any way to make the placeholder to be in 2 lines?"

> "Textarea not working."

> "How to make text bolder using Tailwind?"

---

## Phase 2 — Bug Fixes & Logic Issues

### AI Prompts (ChatGPT)

**Options and score matrix not rendering after auto-generate:**
> "So I found a bug in my code where when I click the manual generate button, options and score are rendering — but when auto generated these are not coming."

> "Also in both I want the options to come first and only then the score matrix."

> "Where to paste this."

> "Is this okay?"

> "So what is the next step?"

> "This happened when I clicked the auto generate."

> "But auto generate button has nothing to do with options right — it generates criteria. Now criteria not coming."

> "Yes now it worked."

> "The problem now I have is that now when clicking auto generate the options and rank matrix are not coming."

---

## Phase 2 — Normalization Research

### Problem Identified
> "Which normalization technique is used now?"

> "How to improve and solve the problem faced." *(Context: the result was negative when actual ranges of values were given. The evaluate decision function was initially designed to work with all criteria values ranging from 1 to 10.)*

### Research into TOPSIS
> "Give difficult test cases to challenge the decision companion system." *(ChatGPT)*

### Weight Input Fixes
> "I want the weights to be within a limit — help me implement it."

> "But after typing 1 I can't change it to any other value by typing."

> "Can I make it show placeholder instead of any other value at first?"

---

## Phase 2 — UI Polish

### AI Prompts (ChatGPT)
> "Give ideas to change the background of the app."

> "Change the background like that of Google Anti-Gravity."

---

## Phase 3 — Claude-Assisted Improvements

### Feature Suggestions
> "I have implemented most of the features in this and want to add some more things. Can you suggest something to add?"

### What-If Sandbox
> "I would like to implement this." *(What-If Sandbox)*

> "The weights are given between 1 to 10 — so should that also be reflected in the sandbox?"

> "The commit changes button should save the values in result also right?"

> "Use Tailwind classname in this file — also the weights are between 1 and 10 but the progress bar is not reacting accordingly."

### TOPSIS Integration
> "This is my evaluate decision function but I would like to use vector normalization plus TOPSIS for this."

### Score Matrix Fix
> "The up and down arrow of the score matrix is not going above 10 and below 1. I have set the arrows to work that way for the weights but not for the criteria values."

> "I don't want the min to be 1 and max to be 10. I want it to be the user's choice."

### Documentation
> "Give a small description about vector normalization plus TOPSIS to add in my build process file."

> "How to add a table in a .md file?"

> "Make this into a table for a .md file."