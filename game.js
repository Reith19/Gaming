// Set up the canvas
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
let fallSpeed = 500; // Fall speed set to 0.5 seconds
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let currentPos;
let lastTime = 0;
let gameOver = false;

// Start the game
function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPiece = generateRandomPiece();
    currentPos = { x: 4, y: 0 };
    gameOver = false;
    requestAnimationFrame(gameLoop);
}

function generateRandomPiece() {
    const shapes = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 1, 0], [0, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]]
    ];
    const index = Math.floor(Math.random() * shapes.length);
    return { shape: shapes[index] };
}

function gameLoop(timestamp) {
    if (gameOver) {
        alert("Game Over!");
        return;
    }
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if (deltaTime > fallSpeed) {
        movePiece(0, 1);
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function movePiece(dx, dy) {
    const newPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    if (isValidMove(currentPiece, newPos)) {
        currentPos = newPos;
        if (dy && !isValidMove(currentPiece, { x: currentPos.x, y: currentPos.y + 1 })) {
            placePiece();
            clearLines();
            currentPiece = generateRandomPiece();
            currentPos = { x: 4, y: 0 };
            if (!isValidMove(currentPiece, currentPos)) {
                gameOver = true;
            }
        }
    }
}

function placePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPos.y + y][currentPos.x + x] = value;
            }
        });
    });
}

function isValidMove(piece, pos) {
    return piece.shape.every((row, dy) => {
        return row.every((value, dx) => {
            let x = pos.x + dx;
            let y = pos.y + dy;
            return value === 0 || (x >= 0 && x < COLS && y < ROWS && board[y][x] === 0);
        });
    });
}

function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(x, y, "#7E1416");
            }
        });
    });
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value !== 0) {
                drawBlock(currentPos.x + dx, currentPos.y + dy, "#FF5733");
            }
        });
    });
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

document.addEventListener("keydown", (event) => {
    if (!gameOver) {
        switch (event.key) {
            case "ArrowLeft":
                movePiece(-1, 0);
                break;
            case "ArrowRight":
                movePiece(1, 0);
                break;
            case "ArrowDown":
                rotatePieceCounterClockwise();
                break;
            case "ArrowUp":
                rotatePieceClockwise();
                break;
            case " ":
                while (movePiece(0, 1)) {} // drop to bottom
                break;
        }
    }
});

function rotatePieceClockwise() {
    let newShape = currentPiece.shape.map((_, index) => currentPiece.shape.map(row => row[index]).reverse());
    let newPiece = { shape: newShape };
    if (isValidMove(newPiece, currentPos)) {
        currentPiece = newPiece;
    }
}

function rotatePieceCounterClockwise() {
    let newShape = currentPiece.shape.map((_, index) => currentPiece.shape.map(row => row[index]));
    let newPiece = { shape: newShape.reverse() };
    if (isValidMove(newPiece, currentPos)) {
        currentPiece = newPiece;
    }
}

// Initialize the game
startGame();
