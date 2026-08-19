export type WordDirection = "horizontal" | "vertical";

export type WordPlacement = {
  word: string;
  label: string;
  row: number;
  col: number;
  direction: WordDirection;
};

export type WordSearchPuzzle = {
  grid: string[][];
  words: string[];
  placements: WordPlacement[];
};

export type WordSearchCell = {
  row: number;
  col: number;
};
