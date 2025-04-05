// Set up the canvas
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// Create an off-screen canvas for double buffering
const offScreenCanvas = document.createElement("canvas");
const offScreenCtx = offScreenCanvas.getContext("2d");

// Game settings
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const FALL_SPEED = 1500; // Fall speed in milliseconds (slowed down)

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

  // Resize the off-screen canvas to match the main canvas size
  offScreenCanvas.width = canvas.width;
  offScreenCanvas.height = canvas.height;

  // Start the game loop with rAF for smoother animation
  requestAnimationFrame(gameLoop);
}

// Generate a random tetrimino piece
function generateRandomPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape };
}

// Game loop
function gameLoop() {
  if (isGameOver) {
    alert("Game Over!");
    return;
  }

  // Update game state
  if (!movePiece(0, 1)) {
    placePiece();
    clearLines();
    currentPiece = generateRandomPiece();
    currentPos = { x: 4, y: 0 };

    if (!isValidMove(currentPiece, currentPos)) {
      isGameOver = true;
    }
  }

  // Render the game
  draw();

  // Request the next frame for smoother animation
  requestAnimationFrame(gameLoop);
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
  // Draw the game to the off-screen canvas first
  offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

  // Draw the board
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === 1) {
        drawBlock(col, row, "#7E1416");
      }
    }
  }

  // Draw the current piece
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        drawBlock(currentPos.x + col, currentPos.y + row, "#7E1416");
      }
    }
  }

  // Draw the shadow (guideline)
  drawLandingGuideline();

  // Finally, copy the off-screen canvas to the main canvas
  ctx.drawImage(offScreenCanvas, 0, 0);
}

// Draw a block with a 3D effect
function drawBlock(x, y, color) {
  const gradient = ctx.createLinearGradient(x * BLOCK_SIZE, y * BLOCK_SIZE, (x + 1) * BLOCK_SIZE, (y + 1) * BLOCK_SIZE);
  gradient.addColorStop(0, "#ff5e57"); // Light side
  gradient.addColorStop(1, "#7e1416"); // Dark side
  ctx.fillStyle = gradient;

  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

  // Add a border for the block
  ctx.strokeStyle = "#5A0B10"; // Dark red border
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the landing guideline
function drawLandingGuideline() {
  let shadowY = currentPos.y;
  // Find where the piece will land
  while (isValidMove(currentPiece, { x: currentPos.x, y: shadowY + 1 })) {
    shadowY++;
  }

  // Draw the guideline
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Solid white for the guideline
  ctx.lineWidth = 2;
  ctx.setLineDash([]); // Solid line for the guideline

  // Draw the guideline as a horizontal line
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
}

// Handle user input
document.addEventListener("keydown", (e) => {
  if (isGameOver) return;

  // Prevent holding down the keys
  if (isMoving) return;

  // Prevent default behavior for arrow keys to avoid toggling other UI elements
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) {
    e.preventDefault(); // Prevent default behavior (e.g., page scroll, UI toggling)
  }

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
