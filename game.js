// Tetris Game Logic
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 30;

let score = 0;
let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
let lastTime = 0;  // Store the last frame time
let deltaTime = 0;  // Accumulate time to control falling speed
let gameRunning = false;  // To track if the game is running or paused
let fallSpeed = 500;  // Falling speed in milliseconds

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

function createTetromino() {
    const shape = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return shape;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

// Draw the shadow of the falling tetromino
function drawShadow() {
    let shadowY = currentPosition.y;
    // Move the shadow down until it hits something
    while (!checkCollisionAt(currentPosition.x, shadowY + 1)) {
        shadowY++;
    }
    
    // Draw shadow in gray
    currentTetromino.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                ctx.fillStyle = 'rgba(128, 128, 128, 0.5)'; // Gray with transparency
                ctx.fillRect((currentPosition.x + cIdx) * BLOCK_SIZE, (shadowY + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect((currentPosition.x + cIdx) * BLOCK_SIZE, (shadowY + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
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

function checkCollisionAt(x, y) {
    return currentTetromino.some((row, rIdx) => {
        return row.some((cell, cIdx) => {
            if (cell) {
                const newX = x + cIdx;
                const newY = y + rIdx;
                return newX < 0 || newX >= COLUMNS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
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
    resetGame();
}

function resetGame() {
    score = 0;
    document.getElementById('score').innerText = 'Score: ' + score;
    board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
    currentTetromino = createTetromino();
    currentPosition = { x: Math.floor(COLUMNS / 2) - 1, y: 0 };
}

function gameLoop(timestamp) {
    // Delta time calculation
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Check if enough time has passed to move the tetromino down
    if (deltaTime > fallSpeed) {  // Controls the falling speed
        moveTetrominoDown();
    }

    drawBoard();
    drawShadow();
    drawTetromino();

    // Request the next animation frame
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

function pauseGame() {
    gameRunning = false;
}

function restartGame() {
    resetGame();
    startGame();
}

// Button Event Listeners
document.getElementById('startBtn').addEventListener('click', function() {
    startGame();
    this.blur(); // Remove focus from button after click
});
document.getElementById('pauseBtn').addEventListener('click', function() {
    pauseGame();
    this.blur(); // Remove focus from button after click
});
document.getElementById('restartBtn').addEventListener('click', function() {
    restartGame();
    this.blur(); // Remove focus from button after click
});

// Keyboard Controls
document.addEventListener('keydown', (event) => {
    event.preventDefault(); // Prevent the default behavior (like page scrolling)

    if (event.key === 'ArrowLeft') moveTetrominoLeft();
    if (event.key === 'ArrowRight') moveTetrominoRight();
    if (event.key === 'ArrowDown') moveTetrominoDown();
    if (event.key === 'ArrowUp') rotateTetromino();
    if (event.key === ' ') { // Spacebar for automatic drop
        while (!checkCollisionAt(currentPosition.x, currentPosition.y + 1)) {
            currentPosition.y++;
        }
        placeTetromino();
        clearLines();
        currentTetromino = createTetromino();
        currentPosition = { x: Math.floor(COLUMNS / 2) - 1, y: 0 };
    }
});
