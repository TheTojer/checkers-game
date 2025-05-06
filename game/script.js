const desk = document.getElementById("desk");
const n_row = 8;
const n_column = 8;

let selected;
let current;

let n_white;
let n_black;
let isMulticapture;

function startGame()
{
    n_white = 12;
    n_black = 12;
    selected = null;
    current = "white";
    createBoard();
    isMulticapture = false;
}

function createBoard()
{
    desk.innerHTML = "";

    for (let r = 0; r < n_row; r++)
    {
        for (let c = 0; c < n_column; c++)
        {
            const s = addSquare((r + c) % 2 === 0 ? "white" : "black", r, c, desk);
            s.addEventListener("click", square_onClick);

            if ((r + c) % 2 !== 0 && (r < 3 || r > 4))
                addChecker(r < 3 ? "black" : "white", r, c, s);
        }
    }
}

function select(checker)
{
    if (selected) deselect();

    checker.addClass("selected");
    selected = checker;
}

function deselect()
{
    selected.removeClass("selected");
    selected = null;
}

function addSquare(className, row, column, parent)
    { return addElem("square", className, row, column, parent); }

function addChecker(className, row, column, parent)
    { return addElem("checker", className, row, column, parent); }

function addElem(firstClass, secondClass, row, column, parent)
{
    const elem = document.createElement("div");

    elem.addClass(firstClass);
    elem.addClass(secondClass);
    elem.dataset.row = row;
    elem.dataset.column = column;

    parent.appendChild(elem);

    return elem;
}

Node.prototype.hasClass = function(className)
    { return this.classList.contains(className); }
Node.prototype.addClass = function(className)
    { return this.classList.add(className); }
Node.prototype.removeClass = function(className)
    { return this.classList.remove(className); }