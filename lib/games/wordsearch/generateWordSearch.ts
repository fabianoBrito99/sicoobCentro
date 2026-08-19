import { shuffle } from "@/lib/utils/shuffle";

export type WordDirection = { dx: number; dy: number };

export type WordPlacement = {
  word: string;
  coords: Array<{ row: number; col: number }>;
};

export type WordSearchData = {
  grid: string[][];
  placements: WordPlacement[];
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const directions: WordDirection[] = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 }
];

const diagonalDirections: WordDirection[] = [
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 }
];

const randomLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];

const normalize = (word: string) =>
  word
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: WordDirection
): boolean {
  for (let i = 0; i < word.length; i += 1) {
    const r = row + i * dir.dy;
    const c = col + i * dir.dx;
    if (r < 0 || c < 0 || r >= grid.length || c >= grid.length) {
      return false;
    }
    const char = grid[r][c];
    if (char !== "" && char !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: WordDirection
): WordPlacement {
  const coords: Array<{ row: number; col: number }> = [];
  for (let i = 0; i < word.length; i += 1) {
    const r = row + i * dir.dy;
    const c = col + i * dir.dx;
    grid[r][c] = word[i];
    coords.push({ row: r, col: c });
  }
  return { word, coords };
}

export function generateWordSearch(
  size: number,
  words: string[],
  allowDiagonals: boolean
): WordSearchData {
  const normalizedWords = words.map(normalize).filter(Boolean);
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const placements: WordPlacement[] = [];
  const dirs = allowDiagonals ? [...directions, ...diagonalDirections] : directions;

  for (const word of shuffle(normalizedWords)) {
    let placed = false;
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      if (!canPlaceWord(grid, word, row, col, dir)) {
        continue;
      }
      placements.push(placeWord(grid, word, row, col, dir));
      placed = true;
      break;
    }
    if (!placed) {
      // palavra nao coube, segue com as demais
    }
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) {
        grid[r][c] = randomLetter();
      }
    }
  }

  return { grid, placements };
}
