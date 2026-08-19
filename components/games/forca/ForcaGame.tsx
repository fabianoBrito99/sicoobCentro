"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  words: string[];
  maxErrors: number;
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

function randomWord(words: string[]): string {
  const candidates = words.map(normalize).filter(Boolean);
  if (!candidates.length) return "JOGABILIDADE";
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function ForcaGame({ words, maxErrors, timeLimitSeconds, sessionKey }: Props) {
  const [target, setTarget] = useState("");
  const [guessed, setGuessed] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    setTarget(randomWord(words));
    setGuessed([]);
    setErrors(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
  }, [sessionKey, timeLimitSeconds, words]);

  useEffect(() => {
    const raw = localStorage.getItem(`forca-best-${maxErrors}`);
    const parsed = raw ? Number(raw) : NaN;
    setBestTime(Number.isFinite(parsed) ? parsed : null);
  }, [maxErrors]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [finished, timeLeft]);

  const maskedWord = useMemo(
    () =>
      target
        .split("")
        .map((char) => (guessed.includes(char) ? char : "_"))
        .join(" "),
    [guessed, target]
  );
  const won = target.length > 0 && target.split("").every((char) => guessed.includes(char));
  const visibleParts = Math.min(6, Math.ceil((errors / Math.max(1, maxErrors)) * 6));
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (won || errors >= maxErrors) {
      setFinished(true);
    }
  }, [errors, maxErrors, won]);

  useEffect(() => {
    if (!finished || !won) return;
    if (bestTime !== null && elapsedTime >= bestTime) return;
    setBestTime(elapsedTime);
    localStorage.setItem(`forca-best-${maxErrors}`, String(elapsedTime));
  }, [bestTime, elapsedTime, finished, maxErrors, won]);

  const onGuess = (letter: string) => {
    if (finished || guessed.includes(letter)) return;
    setGuessed((prev) => [...prev, letter]);
    if (!target.includes(letter)) {
      setErrors((prev) => prev + 1);
    }
  };

  return (
    <section className="panel game-panel">
      <div className="row between">
        <strong>Tempo: {Math.max(0, timeLeft)}s</strong>
        <strong>
          Erros: {errors}/{maxErrors}
        </strong>
      </div>
      <div className="hangman-drawing" aria-label="Desenho da forca">
        <svg viewBox="0 0 220 220" width="220" height="220">
          <line x1="20" y1="205" x2="140" y2="205" stroke="white" strokeWidth="6" />
          <line x1="50" y1="205" x2="50" y2="20" stroke="white" strokeWidth="6" />
          <line x1="50" y1="20" x2="150" y2="20" stroke="white" strokeWidth="6" />
          <line x1="150" y1="20" x2="150" y2="45" stroke="white" strokeWidth="6" />
          {visibleParts >= 1 ? <circle cx="150" cy="65" r="18" stroke="white" strokeWidth="5" fill="none" /> : null}
          {visibleParts >= 2 ? <line x1="150" y1="83" x2="150" y2="130" stroke="white" strokeWidth="5" /> : null}
          {visibleParts >= 3 ? <line x1="150" y1="95" x2="125" y2="112" stroke="white" strokeWidth="5" /> : null}
          {visibleParts >= 4 ? <line x1="150" y1="95" x2="175" y2="112" stroke="white" strokeWidth="5" /> : null}
          {visibleParts >= 5 ? <line x1="150" y1="130" x2="130" y2="160" stroke="white" strokeWidth="5" /> : null}
          {visibleParts >= 6 ? <line x1="150" y1="130" x2="170" y2="160" stroke="white" strokeWidth="5" /> : null}
        </svg>
      </div>
      <div className="forca-word">{maskedWord}</div>
      <div className="touch-keyboard">
        {ALPHABET.split("").map((letter) => (
          <button
            key={letter}
            type="button"
            className={`key-btn ${guessed.includes(letter) ? "key-used" : ""}`}
            onClick={() => onGuess(letter)}
            disabled={guessed.includes(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      {finished ? (
        <div className="result-box">
          <p className="info-text">{won ? "Voce venceu." : `Fim de jogo. Palavra: ${target}`}</p>
          <p className="info-text">Desempenho: {won ? "Vitoria" : "Derrota"} | Erros: {errors}</p>
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
