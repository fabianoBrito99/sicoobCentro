"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  words: string[];
  wordLength: number;
  maxAttempts: number;
  timeLimitSeconds: number;
  sessionKey: string;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const normalize = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "");

type CellState = "correct" | "present" | "absent";

function randomWord(words: string[], wordLength: number): string {
  const candidates = words.map(normalize).filter((w) => w.length === wordLength);
  if (!candidates.length) {
    return "TOTEM".slice(0, wordLength).padEnd(wordLength, "A");
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function compareGuess(guess: string, target: string): CellState[] {
  const result: CellState[] = Array.from({ length: guess.length }, () => "absent");
  const targetArr = target.split("");
  const used = Array.from({ length: target.length }, () => false);

  for (let i = 0; i < guess.length; i += 1) {
    if (guess[i] === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < guess.length; i += 1) {
    if (result[i] === "correct") continue;
    const pos = targetArr.findIndex((char, idx) => !used[idx] && char === guess[i]);
    if (pos >= 0) {
      result[i] = "present";
      used[pos] = true;
    }
  }
  return result;
}

export default function TermoGame({ words, wordLength, maxAttempts, timeLimitSeconds, sessionKey }: Props) {
  const [target, setTarget] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    setTarget(randomWord(words, wordLength));
    setAttempts([]);
    setCurrent("");
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setWon(false);
  }, [sessionKey, timeLimitSeconds, wordLength, words]);

  useEffect(() => {
    const raw = localStorage.getItem(`termo-best-${wordLength}-${maxAttempts}`);
    const parsed = raw ? Number(raw) : NaN;
    setBestTime(Number.isFinite(parsed) ? parsed : null);
  }, [maxAttempts, wordLength]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [finished, timeLeft]);

  const onKey = (key: string) => {
    if (finished) return;
    if (key === "BACK") {
      setCurrent((v) => v.slice(0, -1));
      return;
    }
    if (key === "ENTER") {
      if (current.length !== wordLength) return;
      const guess = current;
      const next = [...attempts, guess];
      setAttempts(next);
      setCurrent("");
      if (guess === target) {
        setFinished(true);
        setWon(true);
        return;
      }
      if (next.length >= maxAttempts) {
        setFinished(true);
      }
      return;
    }
    if (current.length >= wordLength) return;
    setCurrent((v) => `${v}${key}`);
  };

  const rows = useMemo(() => {
    const result: Array<{ text: string; states: CellState[] }> = attempts.map((attempt) => ({
      text: attempt,
      states: compareGuess(attempt, target)
    }));
    if (!finished && attempts.length < maxAttempts) {
      result.push({
        text: current.padEnd(wordLength, " "),
        states: Array.from({ length: wordLength }, () => "absent")
      });
    }
    return result;
  }, [attempts, current, finished, maxAttempts, target, wordLength]);
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (!finished || !won) return;
    if (bestTime !== null && elapsedTime >= bestTime) return;
    setBestTime(elapsedTime);
    localStorage.setItem(`termo-best-${wordLength}-${maxAttempts}`, String(elapsedTime));
  }, [bestTime, elapsedTime, finished, maxAttempts, won, wordLength]);

  return (
    <section className="panel game-panel">
      <div className="row between">
        <strong>Tempo: {Math.max(0, timeLeft)}s</strong>
        <strong>
          Tentativas: {attempts.length}/{maxAttempts}
        </strong>
      </div>
      <div className="termo-grid">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="termo-row"
            style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(34px, 1fr))` }}
          >
            {row.text.split("").map((char, idx) => (
              <span key={`${rowIndex}-${idx}`} className={`termo-cell ${row.states[idx]}`}>
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="touch-keyboard">
        {ALPHABET.split("").map((key) => (
          <button key={key} type="button" className="key-btn" onClick={() => onKey(key)}>
            {key}
          </button>
        ))}
        <button type="button" className="key-btn key-wide" onClick={() => onKey("BACK")}>
          APAGAR
        </button>
        <button type="button" className="key-btn key-wide" onClick={() => onKey("ENTER")}>
          ENTER
        </button>
      </div>
      {finished ? (
        <div className="result-box">
          <p className="info-text">{won ? "Acertou a palavra." : `Fim de jogo. Palavra: ${target}`}</p>
          <p className="info-text">Desempenho: {won ? "Vitoria" : "Derrota"} em {attempts.length} tentativa(s)</p>
          <p className="info-text">
            Seu tempo: {elapsedTime}s | Melhor tempo: {bestTime ? `${bestTime}s` : "sem recorde"}
          </p>
          <Link href="/" className="btn-secondary btn-back">
            Voltar para Catalogo
          </Link>
        </div>
      ) : null}
    </section>
  );
}
