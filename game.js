// Set up the canvas
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// Game settings
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const FALL_SPEED = 1200; // Fall speed in milliseconds

// Shapes of the Tetriminos
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]] // J
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece;
let currentPos;
let gameInterval;
let isGameOver = false;
let isMoving = false; // To track whether the piece is moving

// Start the game
function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPiece = generateRandomPiece();
  currentPos = { x: 4, y: 0 };
  isGameOver = false;

  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, FALL_SPEED);
}

// Generate a random tetrimino piece
function generateRandomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape };
}

// Game loop
function gameLoop() {
  if (isGameOver) {
    clearInterval(gameInterval);
    alert("Game Over!");
    return;
  }

  if (!movePiece(0, 1)) {
    placePiece();
    clearLines();
    currentPiece = generateRandomPiece();
    currentPos = { x: 4, y: 0 };

    if (!isValidMove(currentPiece, currentPos)) {
      isGameOver = true;
    }
  }

  draw();
}

// Move piece by dx and dy
function movePiece(dx, dy) {
  const newPos = { x: currentPos.x + dx, y: currentPos.y + dy };
  if (isValidMove(currentPiece, newPos)) {
    currentPos = newPos;
    return true;
  }
  return false;
}

// Rotate piece clockwise
function rotatePiece() {
  const rotatedShape = currentPiece.shape[0].map((_, index) =>
    currentPiece.shape.map(row => row[index])
  );

  const newPiece = { shape: rotatedShape };
  if (isValidMove(newPiece, currentPos)) {
    currentPiece = newPiece;
  }
}

// Check if the piece is in a valid position
function isValidMove(piece, pos) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] && (pos.y + row >= ROWS || pos.x + col < 0 || pos.x + col >= COLS || board[pos.y + row][pos.x + col])) {
        return false;
      }
    }
  }
  return true;
}

// Place the piece on the board
function placePiece() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        board[currentPos.y + row][currentPos.x + col] = 1;
      }
    }
  }
}

// Clear full lines
function clearLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell === 1)) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(0));
    }
  }
}

// Draw the game
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the board
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === 1) {
        ctx.fillStyle = "#7E1416"; // The color of the blocks
        ctx.strokeStyle = "#5A0B10"; // Crisp border around the blocks
        ctx.lineWidth = 2; // Crisp border width
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // Draw the border
      }
    }
  }

  // Draw the current piece
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        ctx.fillStyle = "#7E1416";
        ctx.strokeStyle = "#5A0B10"; // Crisp border for the current piece
        ctx.lineWidth = 2;
        ctx.fillRect((currentPos.x + col) * BLOCK_SIZE, (currentPos.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect((currentPos.x + col) * BLOCK_SIZE, (currentPos.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // Draw the shadow (guideline)
  drawLandingGuideline();
}

// Draw the landing guideline
function drawLandingGuideline() {
  let shadowY = currentPos.y;
  // Find where the piece will land
  while (isValidMove(currentPiece, { x: currentPos.x, y: shadowY + 1 })) {
    shadowY++;
  }

  // Draw the guideline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Light white for the guideline
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); // Dotted line effect

  // Draw the guideline
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        ctx.beginPath();
        ctx.moveTo((currentPos.x + col) * BLOCK_SIZE + BLOCK_SIZE / 2, (shadowY + row) * BLOCK_SIZE + BLOCK_SIZE);
        ctx.lineTo((currentPos.x + col) * BLOCK_SIZE + BLOCK_SIZE / 2, (shadowY + row + 1) * BLOCK_SIZE);
        ctx.stroke();
      }
    }
  }
  ctx.setLineDash([]); // Reset the line dash
}

// Handle user input
document.addEventListener("keydown", (e) => {
  if (isGameOver) return;

  // Prevent holding down the keys
  if (isMoving) return;

  isMoving = true;

  if (e.key === "ArrowLeft") movePiece(-1, 0);
  if (e.key === "ArrowRight") movePiece(1, 0);
  if (e.key === "ArrowDown") movePiece(0, 1);
  if (e.key === "ArrowUp") rotatePiece();
  if (e.key === " ") movePiece(0, 1); // Automatically drop piece when space is pressed

  setTimeout(() => {
    isMoving = false;
  }, 100); // Short delay to avoid multiple key presses
});

// Start the game
startGame();
