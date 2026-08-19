import { WORD_BANK } from "@/data/words";
import type { WordPlacement, WordSearchPuzzle } from "@/types/wordsearch";
import { shuffle } from "@/lib/utils/shuffle";

// Grade reduzida para 10x10 conforme o ajuste solicitado para o caça-palavras.
const GRID_SIZE = 10;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÂÊÔÃÕÇ";

type WordEntry = {
  label: string;
  word: string;
};

export function normalizeWord(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
}

function formatDisplayWord(word: string): string {
  return word
    .normalize("NFC")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "")
    .toUpperCase();
}

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function canPlaceHorizontal(grid: string[][], word: string, row: number, col: number): boolean {
  if (col + word.length > GRID_SIZE) {
    return false;
  }

  for (let index = 0; index < word.length; index += 1) {
    if (grid[row][col + index] !== "") {
      return false;
    }
  }

  return true;
}

function canPlaceVertical(grid: string[][], word: string, row: number, col: number): boolean {
  if (row + word.length > GRID_SIZE) {
    return false;
  }

  for (let index = 0; index < word.length; index += 1) {
    if (grid[row + index][col] !== "") {
      return false;
    }
  }

  return true;
}

function placeWord(grid: string[][], placement: WordPlacement): void {
  for (let index = 0; index < placement.word.length; index += 1) {
    if (placement.direction === "horizontal") {
      grid[placement.row][placement.col + index] = placement.label[index];
    } else {
      grid[placement.row + index][placement.col] = placement.label[index];
    }
  }
}

function buildSetKey(words: WordEntry[]): string {
  return words
    .map((item) => item.word)
    .sort()
    .join("|");
}

function toWordEntry(label: string): WordEntry {
  return {
    label: formatDisplayWord(label),
    word: normalizeWord(label)
  };
}

export function pickWords(lastKey: string | null): string[] {
  const pool = WORD_BANK.map(toWordEntry).filter((item) => item.word.length >= 4 && item.word.length <= GRID_SIZE);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const picked = shuffle(pool).slice(0, 10);
    if (buildSetKey(picked) !== lastKey) {
      return picked.map((item) => item.label);
    }
  }

  return shuffle(pool)
    .slice(10, 20)
    .map((item) => item.label);
}

export function buildWordSearch(words: string[]): WordSearchPuzzle {
  const entries = words.map(toWordEntry);
  const grid = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ""));
  const placements: WordPlacement[] = [];

  for (const entry of entries) {
    let placed = false;

    for (let attempt = 0; attempt < 150 && !placed; attempt += 1) {
      const horizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (horizontal && canPlaceHorizontal(grid, entry.word, row, col)) {
        const placement: WordPlacement = {
          word: entry.word,
          label: entry.label,
          row,
          col,
          direction: "horizontal"
        };
        placeWord(grid, placement);
        placements.push(placement);
        placed = true;
      }

      if (!horizontal && canPlaceVertical(grid, entry.word, row, col)) {
        const placement: WordPlacement = {
          word: entry.word,
          label: entry.label,
          row,
          col,
          direction: "vertical"
        };
        placeWord(grid, placement);
        placements.push(placement);
        placed = true;
      }
    }
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = randomLetter();
      }
    }
  }

  return {
    grid,
    words: entries.map((item) => item.label),
    placements
  };
}

export function getWordSetKey(words: string[]): string {
  return buildSetKey(words.map(toWordEntry));
}
