
function evaluateDecision(criteria, options, scores) {

  let results = [];

  for (let option of options) {

    let totalScore = 0;

    for (let criterion of criteria) {

      let score = scores[option][criterion.name];
      let adjustedScore;

      // Handle benefit or cost
      if (criterion.type === "benefit") {
        adjustedScore = score;
      } else if (criterion.type === "cost") {
        adjustedScore = 11 - score; // flip 1-10 scale
      }

      totalScore += adjustedScore * criterion.weight;
    }

    results.push({
      name: option,
      total: totalScore
    });
  }

  // Sort descending (highest score first)
  results.sort((a, b) => b.total - a.total);

  return results;
}




document.getElementById("generateBtn").addEventListener("click", function () {
  generateStructure();
});

function generateStructure() {

  // Read counts
  let criteriaCount = parseInt(document.getElementById("criteriaCount").value);
  let optionCount = parseInt(document.getElementById("optionCount").value);

  //  Clear previous sections
  document.getElementById("criteriaSection").innerHTML = "";
  document.getElementById("optionsSection").innerHTML = "";

  // Validation
  if (!criteriaCount || !optionCount) {
    alert("Please enter valid numbers");
    return;
  }

  //  Create Criteria Inputs
  createCriteriaInputs(criteriaCount);

  // Create Option Inputs
  createOptionInputs(optionCount);
}


function createCriteriaInputs(count) {

  let section = document.getElementById("criteriaSection");

  let title = document.createElement("h3");
  title.innerText = "Criteria";
  section.appendChild(title);

  for (let i = 0; i < count; i++) {

    let container = document.createElement("div");

    container.innerHTML = `
      <p>Criterion ${i + 1}</p>
      Name: <input type="text" class="criterion-name"><br>
      Weight: <input type="number" class="criterion-weight"><br>
      Type:
      <select class="criterion-type">
        <option value="benefit">Benefit</option>
        <option value="cost">Cost</option>
      </select>
      <hr>
    `;

    section.appendChild(container);
  }
}

function createOptionInputs(count) {

  let section = document.getElementById("optionsSection");

  let title = document.createElement("h3");
  title.innerText = "Options";
  section.appendChild(title);

  for (let i = 0; i < count; i++) {

    let container = document.createElement("div");

    container.innerHTML = `
      Option ${i + 1} Name:
      <input type="text" class="option-name"><br><br>
    `;

    section.appendChild(container);
  }

  // Add button to create score matrix
  let matrixBtn = document.createElement("button");
  matrixBtn.innerText = "Create Score Matrix";
  matrixBtn.addEventListener("click", generateMatrix);

  section.appendChild(matrixBtn);
}

function generateMatrix() {

  let matrixSection = document.getElementById("matrixSection");
  matrixSection.innerHTML = "";

  let criterionInputs = document.querySelectorAll(".criterion-name");
  let optionInputs = document.querySelectorAll(".option-name");

  let table = document.createElement("table");
  table.border = "1";

  // Header Row
  let headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Option</th>";

  criterionInputs.forEach(c => {
    headerRow.innerHTML += `<th>${c.value}</th>`;
  });

  table.appendChild(headerRow);

  // Rows for each option
  optionInputs.forEach(optionInput => {

    let row = document.createElement("tr");
    row.innerHTML = `<td>${optionInput.value}</td>`;

    criterionInputs.forEach(c => {
      row.innerHTML += `
        <td>
          <input type="number" min="1" max="10"
          data-option="${optionInput.value}"
          data-criterion="${c.value}">
        </td>
      `;
    });

    table.appendChild(row);
  });

  matrixSection.appendChild(table);
}

document.getElementById("evaluate").addEventListener("click", function () {

  let criteria = [];
  let options = [];
  let scores = {};

  let criterionNames = document.querySelectorAll(".criterion-name");
  let criterionWeights = document.querySelectorAll(".criterion-weight");
  let criterionTypes = document.querySelectorAll(".criterion-type");

  for (let i = 0; i < criterionNames.length; i++) {
    criteria.push({
      name: criterionNames[i].value,
      weight: parseFloat(criterionWeights[i].value),
      type: criterionTypes[i].value
    });
  }

  let optionInputs = document.querySelectorAll(".option-name");

  optionInputs.forEach(input => {
    options.push(input.value);
    scores[input.value] = {};
  });

  let scoreInputs = document.querySelectorAll("#matrixSection input");

  scoreInputs.forEach(input => {
    let option = input.dataset.option;
    let criterion = input.dataset.criterion;
    scores[option][criterion] = parseFloat(input.value);
  });

  let results = evaluateDecision(criteria, options, scores);

  displayResults(results);
});

function displayResults(results) {

  let resultSection = document.getElementById("resultSection");
  resultSection.innerHTML = "<h3>Results</h3>";

  results.forEach((res, index) => {
    resultSection.innerHTML += `
      <p>Rank ${index + 1}: ${res.name} — Score: ${res.total}</p>
    `;
  });
}
