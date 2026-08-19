"use client";

import { useEffect, useRef, useState } from "react";
import type { WordSearchCell, WordSearchPuzzle } from "@/types/wordsearch";
import { normalizeWord } from "@/utils/wordsearch";
import styles from "./WordSearchBoard.module.css";

type Props = {
  puzzle: WordSearchPuzzle;
  onScoreChange: (score: number) => void;
  onFoundWordsChange: (words: string[]) => void;
  onFinish: (score: number) => void;
  disabled: boolean;
};

function makeKey(cell: WordSearchCell): string {
  return `${cell.row}-${cell.col}`;
}

function cellsFromSelection(start: WordSearchCell, end: WordSearchCell): WordSearchCell[] {
  if (start.row !== end.row && start.col !== end.col) {
    return [];
  }

  const cells: WordSearchCell[] = [];
  if (start.row === end.row) {
    const [from, to] = [start.col, end.col].sort((a, b) => a - b);
    for (let col = from; col <= to; col += 1) {
      cells.push({ row: start.row, col });
    }
    return cells;
  }

  const [from, to] = [start.row, end.row].sort((a, b) => a - b);
  for (let row = from; row <= to; row += 1) {
    cells.push({ row, col: start.col });
  }
  return cells;
}

export default function WordSearchBoard({
  puzzle,
  onScoreChange,
  onFoundWordsChange,
  onFinish,
  disabled
}: Props) {
  const [selectedCells, setSelectedCells] = useState<WordSearchCell[]>([]);
  const [startCell, setStartCell] = useState<WordSearchCell | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const touchActive = useRef(false);
  const selectedCellsRef = useRef<WordSearchCell[]>([]);

  useEffect(() => {
    selectedCellsRef.current = selectedCells;
  }, [selectedCells]);

  useEffect(() => {
    onScoreChange(foundWords.length);
    onFoundWordsChange(foundWords);
    if (foundWords.length === puzzle.words.length) {
      onFinish(foundWords.length);
    }
  }, [foundWords, onFinish, onFoundWordsChange, onScoreChange, puzzle.words.length]);

  const finishSelection = (cells: WordSearchCell[]) => {
    if (!cells.length) {
      setSelectedCells([]);
      setStartCell(null);
      return;
    }

    const selectedWord = normalizeWord(cells.map((cell) => puzzle.grid[cell.row][cell.col]).join(""));
    const reverse = normalizeWord(
      [...cells]
      .reverse()
      .map((cell) => puzzle.grid[cell.row][cell.col])
      .join("")
    );

    const match = puzzle.placements.find((placement) => placement.word === selectedWord || placement.word === reverse);
    if (match && !foundWords.includes(match.label)) {
      setFoundWords((current) => [...current, match.label]);
    }
    setSelectedCells([]);
    setStartCell(null);
  };

  const updateSelectionByPoint = (point: { clientX: number; clientY: number }) => {
    if (!startCell) {
      return;
    }
    const target = document.elementFromPoint(point.clientX, point.clientY);
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const row = target.dataset.row;
    const col = target.dataset.col;
    if (row === undefined || col === undefined) {
      return;
    }
    setSelectedCells(cellsFromSelection(startCell, { row: Number(row), col: Number(col) }));
  };

  const foundCellKeys = new Set(
    puzzle.placements
      .filter((placement) => foundWords.includes(placement.label))
      .flatMap((placement) =>
        Array.from({ length: placement.word.length }, (_, index) =>
          placement.direction === "horizontal"
            ? makeKey({ row: placement.row, col: placement.col + index })
            : makeKey({ row: placement.row + index, col: placement.col })
        )
      )
  );

  return (
    <div className={styles.board}>
      <div
        className={styles.grid}
        onTouchMove={(event) => {
          if (!touchActive.current || disabled) {
            return;
          }
          event.preventDefault();
          updateSelectionByPoint(event.changedTouches[0]);
        }}
        onTouchEnd={(event) => {
          if (!touchActive.current || disabled) {
            return;
          }
          event.preventDefault();
          touchActive.current = false;
          updateSelectionByPoint(event.changedTouches[0]);
          finishSelection(selectedCellsRef.current);
        }}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cell = { row: rowIndex, col: colIndex };
            const selected = selectedCells.some((item) => item.row === cell.row && item.col === cell.col);
            const found = foundCellKeys.has(makeKey(cell));

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${selected ? styles.selected : ""} ${found ? styles.found : ""}`}
                type="button"
                data-row={rowIndex}
                data-col={colIndex}
                onMouseDown={() => {
                  if (disabled) return;
                  setStartCell(cell);
                  setSelectedCells([cell]);
                }}
                onMouseEnter={() => {
                  if (!startCell || disabled) return;
                  setSelectedCells(cellsFromSelection(startCell, cell));
                }}
                onMouseUp={() =>
                  finishSelection(selectedCellsRef.current.length ? selectedCellsRef.current : [cell])
                }
                onTouchStart={() => {
                  if (disabled) return;
                  touchActive.current = true;
                  setStartCell(cell);
                  setSelectedCells([cell]);
                }}
              >
                {value}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
