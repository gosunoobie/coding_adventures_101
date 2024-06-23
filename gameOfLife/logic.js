const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const resolution = 20;
canvas.width = 1440;
canvas.height = 700;

const COLS = canvas.width / resolution;
const ROWS = canvas.height / resolution;

function buildGrid() {
  return new Array(COLS)
    .fill(null)
    .map(() => new Array(ROWS).fill(null).map(() => 0));
}

let grid = buildGrid();

let desiredFPS = 4; // Desired frame rate
let interval = 1000 / desiredFPS; // Interval in milliseconds
let lastTime = 0; // The last time we updated the frame

let isMouseDown = false;

// Helper function to get cell coordinates from mouse event
function getCellCoordinates(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  const col = Math.floor(x / resolution);
  const row = Math.floor(y / resolution);
  return { col, row };
}

// Mouse event handlers
canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  const { col, row } = getCellCoordinates(event);
  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    grid[col][row] = 1;
    grid[col + 1][row + 1] = 1;
    grid[col][row + 1] = 1;
    grid[col + 1][row] = 1;
    grid[col - 1][row - 1] = 1;
    grid[col][row - 1] = 1;
    grid[col - 1][row] = 1;
    grid[col + 1][row - 1] = 1;
    grid[col - 1][row + 1] = 1;
    render(grid); // Re-render the grid to show the updated state
  }
});

canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    const { col, row } = getCellCoordinates(event);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      grid[col][row] = 1;
      render(grid); // Re-render the grid to show the updated state
    }
  }
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

function update(currentTime) {
  requestAnimationFrame(update);

  // Calculate the time elapsed since the last frame
  let deltaTime = currentTime - lastTime;

  // Check if the desired interval has elapsed
  if (deltaTime > interval) {
    // Update the last time
    lastTime = currentTime - (deltaTime % interval);

    // Update grid and render
    grid = nextGen(grid);
    render(grid);
  }
}

function nextGen(grid) {
  const nextGen = grid.map((arr) => [...arr]);

  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];
      let numNeighbours = 0;
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }
          const x_cell = col + i;
          const y_cell = row + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            const currentNeighbor = grid[col + i][row + j];
            numNeighbours += currentNeighbor;
          }
        }
      }
      // rules
      if (cell === 1 && numNeighbours < 2) {
        nextGen[col][row] = 0;
      } else if (cell === 1 && numNeighbours > 3) {
        nextGen[col][row] = 0;
      } else if (cell === 0 && numNeighbours === 3) {
        nextGen[col][row] = 1;
      }
    }
  }

  return nextGen;
}

function render(grid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before re-rendering
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];
      ctx.beginPath();
      ctx.rect(col * resolution, row * resolution, resolution, resolution);
      ctx.fillStyle = cell ? "#63863f" : "white";
      ctx.strokeStyle = cell ? "white" : "#63863f";
      ctx.fill();
      ctx.stroke();
    }
  }
}

// Start the animation
requestAnimationFrame(update);
