"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateMaze } from "@/lib/games/maze/generateMaze";

type Props = {
  size: "S" | "M" | "L";
  difficulty: "easy" | "medium" | "hard";
  timeLimitSeconds: number;
};

type Pos = { x: number; y: number };

const dirMap = {
  ArrowUp: { dx: 0, dy: -1, wall: "top" as const },
  ArrowRight: { dx: 1, dy: 0, wall: "right" as const },
  ArrowDown: { dx: 0, dy: 1, wall: "bottom" as const },
  ArrowLeft: { dx: -1, dy: 0, wall: "left" as const }
};

export default function MazeGame({ size, difficulty, timeLimitSeconds }: Props) {
  const [seed, setSeed] = useState(0);
  const maze = useMemo(() => generateMaze(size), [seed, size]);
  const [player, setPlayer] = useState<Pos>(maze.start);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const speedPenalty = difficulty === "hard" ? 2 : difficulty === "medium" ? 1 : 0;

  useEffect(() => {
    setPlayer(maze.start);
    setTimeLeft(Math.max(10, timeLimitSeconds - speedPenalty * 8));
    setFinished(false);
  }, [maze.end.x, maze.end.y, maze.start.x, maze.start.y, seed, speedPenalty, timeLimitSeconds]);

  useEffect(() => {
    const raw = localStorage.getItem(`maze-best-${size}-${difficulty}`);
    const parsed = raw ? Number(raw) : NaN;
    setBestTime(Number.isFinite(parsed) ? parsed : null);
  }, [difficulty, size]);

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
    if (player.x === maze.end.x && player.y === maze.end.y) {
      setFinished(true);
    }
  }, [maze.end.x, maze.end.y, player.x, player.y]);

  const won = finished && player.x === maze.end.x && player.y === maze.end.y;
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (!won) return;
    if (bestTime !== null && elapsedTime >= bestTime) return;
    setBestTime(elapsedTime);
    localStorage.setItem(`maze-best-${size}-${difficulty}`, String(elapsedTime));
  }, [bestTime, difficulty, elapsedTime, size, won]);

  const move = useCallback(
    (dx: number, dy: number, wall: "top" | "right" | "bottom" | "left") => {
      if (finished) return;
      const current = maze.cells[player.y][player.x];
      if (current.walls[wall]) return;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx < 0 || ny < 0 || nx >= maze.width || ny >= maze.height) return;
      setPlayer({ x: nx, y: ny });
    },
    [finished, maze.cells, maze.height, maze.width, player.x, player.y]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dir = dirMap[event.key as keyof typeof dirMap];
      if (!dir) return;
      event.preventDefault();
      move(dir.dx, dir.dy, dir.wall);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const onTouchEnd = (x: number, y: number) => {
    if (!touchStart) return;
    const dx = x - touchStart.x;
    const dy = y - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 24) move(1, 0, "right");
      if (dx < -24) move(-1, 0, "left");
    } else {
      if (dy > 24) move(0, 1, "bottom");
      if (dy < -24) move(0, -1, "top");
    }
    setTouchStart(null);
  };

  return (
    <section className="panel">
      <div className="row between">
        <strong>Tempo: {Math.max(0, timeLeft)}s</strong>
        <strong>Dificuldade: {difficulty}</strong>
      </div>
      <div
        className="maze-grid"
        style={{ gridTemplateColumns: `repeat(${maze.width}, minmax(12px, 1fr))` }}
        onTouchStart={(e) => setTouchStart({ x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY })}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
      >
        {maze.cells.flat().map((cell) => {
          const isPlayer = player.x === cell.x && player.y === cell.y;
          const isEnd = maze.end.x === cell.x && maze.end.y === cell.y;
          const isStart = maze.start.x === cell.x && maze.start.y === cell.y;
          return (
            <div
              key={`${cell.x}-${cell.y}`}
              className={`maze-cell ${isEnd ? "end" : ""} ${isStart ? "start" : ""}`}
              style={{
                borderTop: cell.walls.top ? "2px solid #fff" : "2px solid transparent",
                borderRight: cell.walls.right ? "2px solid #fff" : "2px solid transparent",
                borderBottom: cell.walls.bottom ? "2px solid #fff" : "2px solid transparent",
                borderLeft: cell.walls.left ? "2px solid #fff" : "2px solid transparent"
              }}
            >
              {isPlayer ? <span className="maze-player" /> : null}
            </div>
          );
        })}
      </div>
      <div className="maze-controls">
        <button className="btn-secondary maze-arrow" type="button" onClick={() => move(0, -1, "top")}>
          ↑
        </button>
        <div className="maze-controls-row">
          <button className="btn-secondary maze-arrow" type="button" onClick={() => move(-1, 0, "left")}>
            ←
          </button>
          <button className="btn-secondary maze-arrow" type="button" onClick={() => move(1, 0, "right")}>
            →
          </button>
        </div>
        <button className="btn-secondary maze-arrow" type="button" onClick={() => move(0, 1, "bottom")}>
          ↓
        </button>
      </div>
      {finished ? (
        <div className="result-box">
          <p className="info-text">{won ? "Voce chegou ao fim." : "Tempo esgotado."}</p>
          <p className="info-text">Desempenho: {won ? "Concluido" : "Nao concluiu"}</p>
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
