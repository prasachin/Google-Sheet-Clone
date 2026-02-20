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
