// Google sheet'clone
// Our goal:
// 1. cell's value editing.
// 2. formulla writting section
// 3. basic formula suppport
// 4. Basic formatting of the values.
// 5. automatic recalculation of the values when the dependent cells are updated.
// 6. tracking deps.

// what would be our basic layout or architecture.(a + b)

// toolbar: formatting buttons, formula bar, address also.
// row header: A , B , C......Z
// column header: 1, 2, 3, 4, 5.....
// cell: the intersection of row and column header.

// how user can interact and use the application.
// 1. click on cell to edit its value.
// 2. enter in the formula bar and write.
// Formula format and syntax, destination cell;
//  cell can be rep as A1, B2, C3, D4, E5....Z1000
// i wana add A1 and B1 value.
// I will have to click in the destination cell (where the result will be stored).
// Then write the formula in the formula bar like this:A1+B1
// hit enter, u will get result in the destination cell.

// we will have some formatting buttons
//  click on the cell whose value u want to format.
// then click on the respective formatting button.

// data handling.
const rows = 100;
const cols = 26;
let sheetDB = [];
let selectedCell = null;
function createSheetDB() {
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        value: "",
        formula: "",
        children: [],
        parents: [],
      });
    }
    sheetDB.push(row);
  }
}

createSheetDB();

// I am generating grid header.
const topRow = document.querySelector(".top-row");
const leftCol = document.querySelector(".left-col");
const cellsContainer = document.querySelector(".cells");

// console.log(topRow, leftCol, cellsContainer);

function generateHeaders() {
  // generate columns header
  for (let i = 0; i < 26; i++) {
    let cell = document.createElement("div");
    cell.textContent = String.fromCharCode(65 + i);
    cell.classList.add("cell");
    topRow.appendChild(cell);
  }

  // generate row headers.
  for (let i = 0; i < 100; i++) {
    let cell = document.createElement("div");
    cell.textContent = i + 1;
    cell.classList.add("cell");
    leftCol.appendChild(cell);
  }
}

function generateCells() {
  for (let i = 0; i < rows; i++) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.setAttribute("rid", i);
      cell.setAttribute("cid", j);
      cell.contentEditable = "true";
      rowDiv.appendChild(cell);

      cell.addEventListener("click", function () {
        selectedCell = cell;
        let ele = document.getElementById("address");
        let address = String.fromCharCode(65 + j) + (i + 1);
        ele.value = address;
      });
    }
    cellsContainer.appendChild(rowDiv);
  }
}

generateHeaders();
generateCells();

const boldBtn = document.getElementById("bold");
const italicBtn = document.getElementById("italic");

boldBtn.addEventListener("click", function () {
  if (selectedCell) {
    selectedCell.style.fontWeight = "bold";
  }
});

italicBtn.addEventListener("click", function () {
  if (selectedCell) {
    selectedCell.style.fontStyle = "italic";
  }
});

function removeDependencies(rid, cid) {
  let parents = sheetDB[rid][cid].parents;
  parents.forEach(({ rid: pr, cid: pc }) => {
    sheetDB[pr][pc].children = sheetDB[pr][pc].children.filter(
      (child) => !(child.childRID == rid && child.childCID == cid),
    );
  });
  sheetDB[rid][cid].parents = [];
}

function addDependencies(formula, childRID, childCID) {
  let tokens = formula.split(" ");
  tokens.forEach((token) => {
    if (/^[A-Z][0-9]+$/.test(token)) {
      let { rid, cid } = getRIDCID(token);
      sheetDB[rid][cid].children.push({ childRID, childCID });
      sheetDB[childRID][childCID].parents.push({ rid, cid });
    }
  });
}

function updateChildren(rid, cid) {
  let children = sheetDB[rid][cid].children;
  children.forEach((child) => {
    let childobj = sheetDB[child.childRID][child.childCID];
    let newval = evaluateFormula(childobj.formula);
    childobj.value = newval;
    updateCellUI(child.childRID, child.childCID, newval);
    updateChildren(child.childRID, child.childCID);
  });
}

function updateCellUI(rid, cid, value) {
  let cell = document.querySelector(`.cell[rid="${rid}"][cid="${cid}"]`);
  if (cell) cell.textContent = value;
}

cellsContainer.addEventListener(
  "blur",
  function (e) {
    let cell = e.target;
    if (!cell.classList.contains("cell")) return;
    let rid = Number(cell.getAttribute("rid"));
    let cid = Number(cell.getAttribute("cid"));
    let value = cell.textContent;
    if (sheetDB[rid][cid].formula) {
      removeDependencies(rid, cid);
    }
    sheetDB[rid][cid].formula = "";
    sheetDB[rid][cid].value = value;
    updateChildren(rid, cid);
  },
  true,
);
let formulaInput = document.getElementById("formula");

formulaInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    let address = document.getElementById("address").value;
    let formula = formulaInput.value;
    if (!address) return;
    let { rid, cid } = getRIDCID(address);
    if (sheetDB[rid][cid].formula) {
      removeDependencies(rid, cid);
    }
    let value = evaluateFormula(formula);
    sheetDB[rid][cid].value = value;
    addDependencies(formula, rid, cid);
    updateCellUI(rid, cid, value);
    updateChildren(rid, cid);
  }
});

function evaluateFormula(formula) {
  if (!formula) return "";
  let tokens = formula.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    if (/^[A-Z][0-9]+$/.test(tokens[i])) {
      let { rid, cid } = getRIDCID(tokens[i]);
      let value = sheetDB[rid][cid].value || 0;
      tokens[i] = value === "" ? 0 : value;
    }
  }
  let expression = tokens.join(" ");
  try {
    return eval(expression);
  } catch (error) {
    console.error("Error evaluating formula:", error);
    return "error";
  }
}

function getRIDCID(add) {
  let cid = add.charCodeAt(0) - 65;
  let rid = Number(add.slice(1)) - 1;
  return { rid, cid };
}

let clear = document.getElementById("clear");
clear.addEventListener("click", function () {
  let inputBar = document.getElementById("formula");
  inputBar.value = "";
});
