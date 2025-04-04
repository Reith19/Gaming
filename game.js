// Tetris Game Logic
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;

let score = 0;
let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

const tetrominos = [
    [[1, 1, 1, 1]], // I Shape
    [[1, 1], [1, 1]], // O Shape
    [[1, 1, 0], [0, 1, 1]], // S Shape
    [[0, 1, 1], [1, 1, 0]], // Z Shape
    [[1, 1, 1], [0, 1, 0]], // T Shape
    [[1, 0, 0], [1, 1, 1]], // L Shape
    [[0, 0, 1], [1, 1, 1]]  // J Shape
];

let currentTetromino = createTetromino();
let currentPosition = { x: Math.floor(COLUMNS / 2) - 1, y: 0 };
let lastTime = 0;  // Store the last frame time
let deltaTime = 0;  // Accumulate time to control falling speed
let gameRunning = false;  // To track if the game is running or paused
let fallSpeed = 700;  // Falling speed in milliseconds (increase for slower fall)

function createTetromino() {
    const shape = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return shape;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawTetromino() {
    currentTetromino.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                ctx.fillStyle = 'red';
                ctx.fillRect((currentPosition.x + cIdx) * BLOCK_SIZE, (currentPosition.y + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect((currentPosition.x + cIdx) * BLOCK_SIZE, (currentPosition.y + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function moveTetrominoDown() {
    currentPosition.y++;
    if (checkCollision()) {
        currentPosition.y--;
        placeTetromino();
        clearLines();
        currentTetromino = createTetromino();
        currentPosition = { x: Math.floor(COLUMNS / 2) - 1, y: 0 };
        if (checkCollision()) {
            gameOver();
        }
    }
}

function checkCollision() {
    return currentTetromino.some((row, rIdx) => {
        return row.some((cell, cIdx) => {
            if (cell) {
                const x = currentPosition.x + cIdx;
                const y = currentPosition.y + rIdx;
                return x < 0 || x >= COLUMNS || y >= ROWS || (y >= 0 && board[y][x]);
            }
            return false;
        });
    });
}

function placeTetromino() {
    currentTetromino.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                board[currentPosition.y + rIdx][currentPosition.x + cIdx] = 'red';
            }
        });
    });
}

function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell)) {
            board.splice(row, 1);
            board.unshift(Array(COLUMNS).fill(null));
            score += 100;
            document.getElementById('score').innerText = 'Score: ' + score;
        }
    }
}

function gameOver() {
    alert('Game Over');
    board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
    score = 0;
    document.getElementById('score').innerText = 'Score: ' + score;
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (deltaTime > fallSpeed) {
        moveTetrominoDown();
    }

    drawBoard();
    drawTetromino();

    // Keep the game loop running if the game is still running
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game when the start button is clicked
document.getElementById('startBtn').addEventListener('click', function() {
    gameRunning = true;
    requestAnimationFrame(gameLoop);
});
