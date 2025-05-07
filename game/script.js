const desk = document.getElementById("desk");
const state = document.getElementById("status");
const n_row = 8;
const n_column = 8;

let selected;
let current;

let n_white;
let n_black;
let isMulticapture;

//#region main

function startGame()
{
    n_white = 12;
    n_black = 12;
    selected = null;
    current = "white";
    setState();

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

function square_onClick(e)
{
    const s = e.target.hasClass("square") ? e.target : e.target.parentElement;
    const r = parseInt(s.dataset.row);
    const c = parseInt(s.dataset.column);

    if (selected)
    {
        if (selected === s.firstChild) deselect();
        else if (!s.firstChild && isValidMode(r, c))
        {
            console.log(isValidMode(r, c));
            moveChecker(selected, r, c, s);
        }
    }
    else if (s.firstChild && isCurrentChecker(s)) select(s.firstChild)
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

function checkWin()
{
    if (n_white === 0 || n_black === 0) return endGame(current);
    return false;
}

function endTurn()
{
    current = current === "white" ? "black" : "white";
    setState();
}

function endGame(winner)
{
    state.innerText = `${current} wins!!!`;
    return true;
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

function setState()
{
    state.innerText = `${current} turn`;
}

Node.prototype.hasClass = function(className)
    { return this.classList.contains(className); }
Node.prototype.addClass = function(className)
    { return this.classList.add(className); }
Node.prototype.removeClass = function(className)
    { return this.classList.remove(className); }

function getByRowColumn(row, column)
    { return document.querySelector(`[data-row="${row}"][data-column="${column}"]`); }

function isCurrentChecker(elem)
    { return elem.firstChild.hasClass("checker") && elem.firstChild.hasClass(current); }
function notCurrentChecker(elem)
    { return elem.firstChild.hasClass("checker") && !elem.firstChild.hasClass(current); }

function isDam(elem)
    { return elem.hasClass("dam"); }
function isCapture(row, column)
    { return Math.abs(row) === 2 && Math.abs(column) === 2; }

//#endregion

function isValidMode(row, column)
{
    const r_t = parseInt(selected.dataset.row);
    const c_t = parseInt(selected.dataset.column);

    const r_move = row - r_t;
    const c_move = column - c_t;

    const captures = getAvailableCaptures(current);

    const is_capt = isCapture(r_move, c_move);

    if (captures.length > 0 && !is_capt) return false;

    if (!isDam(selected) && !isMulticapture)
        if (current === "white" && r_move > 0 ||
            current === "black" && r_move < 0)
        return false;

    if (is_capt)
    {
        const r_mid = r_t + r_move / 2;
        const c_mid = c_t + c_move / 2;
        const s_mid = getByRowColumn(r_mid, c_mid);

        if (s_mid.firstChild && notCurrentChecker(s_mid)) return true;
    }
    else if (Math.abs(r_move) === 1 && Math.abs(c_move) === 1) return true;

    return false;
}

function moveChecker(checker, row, column, square)
{
    const r_t = parseInt(checker.dataset.row);
    const c_t = parseInt(checker.dataset.column);
    const s_target = getByRowColumn(row, column);
    const r_move = row - r_t;
    const c_move = column - c_t;

    const is_capt = isCapture(r_move, c_move);

    let b;

    if (is_capt)
    {
        const r_mid = r_t + r_move / 2;
        const c_mid = c_t + c_move / 2;
        const s_mid = getByRowColumn(r_mid, c_mid);

        if (s_mid.firstChild && notCurrentChecker(s_mid))
        {
            s_mid.removeChild(s_mid.firstChild);
            current === "white" ? n_black-- : n_white--;
            b = performMove(checker, s_target, row, column);

            const furtherCaptures = getAvailableCapturesForChecker(checker);
            if (furtherCaptures.length > 0)
            {
                isMulticapture = true;
                select(checker);
                return;
            }
            else isMulticapture = false;
        }
    }
    else b = performMove(checker, square, row, column);

    if (!b) endTurn();
}

function performMove(checker, squareTarget, row, column)
{
    squareTarget.appendChild(checker);

    checker.dataset.row = row;
    checker.dataset.column = column;
    deselect();

    if (row === 0 && current === "white" ||
        row === 7 && current === "black")
        checker.addClass("dam");

    return checkWin();
}

function getAvailableCaptures(player)
{
    let captures = [];
    const checkers = document.querySelectorAll(`.checker.${player}`);

    checkers.forEach(ch =>
    {
        captures = captures.concat(getAvailableCapturesForChecker(ch));
    });

    return captures;
}

function getAvailableCapturesForChecker(checker)
{
    const row = parseInt(checker.dataset.row);
    const column = parseInt(checker.dataset.column);
    const directions = 
    [
        { row: 1, column: 1 },
        { row: 1, column: -1 },
        { row: -1, column: 1 },
        { row: -1, column: -1 },
    ];

    const captures = [];

    directions.forEach(dir =>
    {
        const r_target = row + 2 * dir.row;
        const c_target = column + 2 * dir.column;
        const r_mid = row + dir.row;
        const c_mid = column + dir.column;
        const s_target = getByRowColumn(r_target, c_target);
        const s_mid = getByRowColumn(r_mid, c_mid);

        if (s_target && s_mid && !s_target.firstChild && s_mid.firstChild &&
            notCurrentChecker(s_mid))
            captures.push({ checker, r_target, c_target });
    });

    return captures;
}

startGame();