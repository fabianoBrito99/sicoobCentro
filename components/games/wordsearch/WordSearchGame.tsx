"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateWordSearch } from "@/lib/games/wordsearch/generateWordSearch";

type Props = {
  gridSize: number;
  words: string[];
  difficulty: "easy" | "medium" | "hard";
  wordsPerDifficulty: { easy: number; medium: number; hard: number };
  allowDiagonals: boolean;
  timeLimitSeconds: number;
};

type Point = { row: number; col: number };
type TouchPoint = { clientX: number; clientY: number };

const normalize = (word: string) =>
  word
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");

function betweenPoints(a: Point, b: Point): Point[] {
  const dr = b.row - a.row;
  const dc = b.col - a.col;
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
    return [];
  }
  return Array.from({ length: steps + 1 }, (_, i) => ({
    row: a.row + i * stepR,
    col: a.col + i * stepC
  }));
}

const keyFromPoint = (point: Point) => `${point.row}-${point.col}`;

function shuffleList<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WordSearchGame({
  gridSize,
  words,
  difficulty,
  wordsPerDifficulty,
  allowDiagonals,
  timeLimitSeconds
}: Props) {
  const [seed, setSeed] = useState(0);
  const selectedWords = useMemo(() => {
    const target = Math.max(
      1,
      difficulty === "easy"
        ? wordsPerDifficulty.easy
        : difficulty === "hard"
        ? wordsPerDifficulty.hard
        : wordsPerDifficulty.medium
    );
    return shuffleList(words).slice(0, Math.min(target, words.length));
  }, [difficulty, seed, words, wordsPerDifficulty.easy, wordsPerDifficulty.hard, wordsPerDifficulty.medium]);

  const data = useMemo(
    () => generateWordSearch(gridSize, selectedWords, allowDiagonals),
    [allowDiagonals, gridSize, selectedWords]
  );
  const targetWords = useMemo(() => data.placements.map((p) => p.word), [data.placements]);
  const [selectedStart, setSelectedStart] = useState<Point | null>(null);
  const [selectedCells, setSelectedCells] = useState<Point[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [touching, setTouching] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    setSelectedStart(null);
    setSelectedCells([]);
    setFoundWords([]);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
  }, [data.grid, difficulty, timeLimitSeconds]);

  useEffect(() => {
    const raw = localStorage.getItem(`wordsearch-best-${difficulty}`);
    const parsed = raw ? Number(raw) : NaN;
    setBestTime(Number.isFinite(parsed) ? parsed : null);
  }, [difficulty]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [finished, timeLeft]);

  useEffect(() => {
    if (targetWords.length && foundWords.length === targetWords.length) {
      setFinished(true);
    }
  }, [foundWords.length, targetWords.length]);

  const won = finished && foundWords.length === targetWords.length;
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (!won) return;
    if (bestTime !== null && elapsedTime >= bestTime) return;
    setBestTime(elapsedTime);
    localStorage.setItem(`wordsearch-best-${difficulty}`, String(elapsedTime));
  }, [bestTime, difficulty, elapsedTime, won]);

  const tryFinishSelection = (end: Point) => {
    if (!selectedStart) return;
    const line = betweenPoints(selectedStart, end);
    if (!line.length) {
      setSelectedStart(null);
      setSelectedCells([]);
      return;
    }
    const sequence = line.map(({ row, col }) => data.grid[row][col]).join("");
    const reverse = line
      .slice()
      .reverse()
      .map(({ row, col }) => data.grid[row][col])
      .join("");
    const normalizedWords = targetWords.map(normalize);
    const hitIndex = normalizedWords.findIndex((w) => w === sequence || w === reverse);
    if (hitIndex >= 0) {
      const hit = targetWords[hitIndex];
      if (!foundWords.includes(hit)) {
        setFoundWords((prev) => [...prev, hit]);
      }
    }
    setSelectedStart(null);
    setSelectedCells([]);
  };

  const selectedSet = new Set(selectedCells.map(keyFromPoint));
  const foundCellSet = useMemo(() => {
    const foundNormalized = new Set(foundWords.map(normalize));
    const keys = new Set<string>();
    data.placements.forEach((placement) => {
      if (!foundNormalized.has(normalize(placement.word))) {
        return;
      }
      placement.coords.forEach((coord) => keys.add(`${coord.row}-${coord.col}`));
    });
    return keys;
  }, [data.placements, foundWords]);
  const progress = targetWords.length ? Math.round((foundWords.length / targetWords.length) * 100) : 0;

  const updateTouchSelection = (touch: TouchPoint) => {
    if (!selectedStart) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!(element instanceof HTMLElement)) return;
    const row = element.dataset.row;
    const col = element.dataset.col;
    if (row === undefined || col === undefined) return;
    const point = { row: Number(row), col: Number(col) };
    setSelectedCells(betweenPoints(selectedStart, point));
  };

  return (
    <section className="panel">
      <div className="row between">
        <strong>Tempo: {Math.max(0, timeLeft)}s</strong>
        <strong>Encontrado: {progress}%</strong>
      </div>

      <div
        className="word-grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        onTouchMove={(e) => {
          if (!touching) return;
          e.preventDefault();
          updateTouchSelection(e.changedTouches[0]);
        }}
        onTouchEnd={(e) => {
          if (!touching || !selectedCells.length) return;
          e.preventDefault();
          const last = selectedCells[selectedCells.length - 1];
          tryFinishSelection(last);
          setTouching(false);
        }}
      >
        {data.grid.map((row, rowIndex) =>
          row.map((char, colIndex) => {
            const point = { row: rowIndex, col: colIndex };
            const selected = selectedSet.has(keyFromPoint(point));
            const found = foundCellSet.has(keyFromPoint(point));
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`word-cell ${selected ? "selected" : ""} ${found ? "found" : ""}`}
                data-row={rowIndex}
                data-col={colIndex}
                type="button"
                onMouseDown={() => {
                  setSelectedStart(point);
                  setSelectedCells([point]);
                }}
                onMouseEnter={() => {
                  if (!selectedStart) return;
                  setSelectedCells(betweenPoints(selectedStart, point));
                }}
                onMouseUp={() => tryFinishSelection(point)}
                onTouchStart={() => {
                  setTouching(true);
                  setSelectedStart(point);
                  setSelectedCells([point]);
                }}
                onTouchEnd={() => {
                  tryFinishSelection(point);
                  setTouching(false);
                }}
              >
                {char}
              </button>
            );
          })
        )}
      </div>

      <div className="row wrap">
        {targetWords.map((word) => (
          <span key={word} className={`word-tag ${foundWords.includes(word) ? "found" : ""}`}>
            {word}
          </span>
        ))}
      </div>

      {finished ? (
        <div className="result-box">
          <p className="info-text">{won ? "Todas as palavras encontradas." : "Tempo esgotado."}</p>
          <p className="info-text">Desempenho: {progress}%</p>
          <p className="info-text">
            Seu tempo: {elapsedTime}s | Melhor tempo: {bestTime ? `${bestTime}s` : "sem recorde"}
          </p>
          <div className="row wrap">
            <button className="btn-secondary" type="button" onClick={() => setSeed((value) => value + 1)}>
              Jogar novamente
            </button>
            <Link href="/" className="btn-secondary btn-back">
              Voltar para Catalogo
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
