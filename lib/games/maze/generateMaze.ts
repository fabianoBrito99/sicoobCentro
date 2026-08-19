export type MazeCell = {
  x: number;
  y: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};

export type MazeData = {
  width: number;
  height: number;
  cells: MazeCell[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const directions = [
  { dx: 0, dy: -1, wall: "top", opposite: "bottom" },
  { dx: 1, dy: 0, wall: "right", opposite: "left" },
  { dx: 0, dy: 1, wall: "bottom", opposite: "top" },
  { dx: -1, dy: 0, wall: "left", opposite: "right" }
] as const;

const randomInt = (max: number) => Math.floor(Math.random() * max);

export const mazeSizeFromPreset = (size: "S" | "M" | "L"): number => {
  if (size === "S") return 8;
  if (size === "L") return 16;
  return 12;
};

export function generateMaze(size: "S" | "M" | "L"): MazeData {
  const base = mazeSizeFromPreset(size);
  const width = base;
  const height = base;
  const cells: MazeCell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      visited: false,
      walls: {
        top: true,
        right: true,
        bottom: true,
        left: true
      }
    }))
  );

  const stack: MazeCell[] = [];
  const start = cells[0][0];
  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = directions
      .map((dir) => ({
        dir,
        nx: current.x + dir.dx,
        ny: current.y + dir.dy
      }))
      .filter(
        ({ nx, ny }) => nx >= 0 && ny >= 0 && nx < width && ny < height && !cells[ny][nx].visited
      );

    if (!neighbors.length) {
      stack.pop();
      continue;
    }

    const next = neighbors[randomInt(neighbors.length)];
    const neighbor = cells[next.ny][next.nx];

    current.walls[next.dir.wall] = false;
    neighbor.walls[next.dir.opposite] = false;
    neighbor.visited = true;
    stack.push(neighbor);
  }

  cells.forEach((row) => row.forEach((cell) => (cell.visited = false)));

  return {
    width,
    height,
    cells,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 }
  };
}
