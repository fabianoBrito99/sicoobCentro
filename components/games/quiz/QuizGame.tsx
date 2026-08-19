"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QuizQuestion } from "@/lib/schemas/project";
import styles from "./QuizGame.module.css";

type Props = {
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  mode: "single" | "multi";
  statsKey: string;
  sessionKey: string;
};

type BestStats = {
  bestScore: number;
  bestTimeSeconds: number;
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizGame({ questions, timeLimitSeconds, mode, statsKey, sessionKey }: Props) {
  const quizQuestions = useMemo(() => shuffle(questions), [questions, sessionKey]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [bestStats, setBestStats] = useState<BestStats | null>(null);
  const [lockedOption, setLockedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const question = quizQuestions[index];

  useEffect(() => {
    setIndex(0);
    setAnswers([]);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
    setLockedOption(null);
    setFeedback(null);
  }, [quizQuestions, timeLimitSeconds]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`quiz-best-${statsKey}`);
      if (!raw) {
        setBestStats(null);
        return;
      }
      const parsed = JSON.parse(raw) as BestStats;
      if (typeof parsed.bestScore === "number" && typeof parsed.bestTimeSeconds === "number") {
        setBestStats(parsed);
      }
    } catch {
      setBestStats(null);
    }
  }, [statsKey]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [finished, timeLeft]);

  const onAnswer = (optionIndex: number) => {
    if (!question || finished || lockedOption !== null) return;
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
    setLockedOption(optionIndex);
    const hit = optionIndex === question.correctIndex;
    setFeedback(hit ? "correct" : "wrong");

    setTimeout(() => {
      setLockedOption(null);
      setFeedback(null);
      if (mode === "single" || index === quizQuestions.length - 1) {
        setFinished(true);
        return;
      }
      setIndex((i) => Math.min(i + 1, quizQuestions.length - 1));
    }, 2000);
  };

  const score = useMemo(() => {
    if (!quizQuestions.length) return 0;
    const correct = quizQuestions.filter((q, i) => answers[i] === q.correctIndex).length;
    return Math.round((correct / quizQuestions.length) * 100);
  }, [answers, quizQuestions]);
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (!finished || !quizQuestions.length) return;
    const current: BestStats = {
      bestScore: score,
      bestTimeSeconds: elapsedTime
    };
    const isBetter =
      !bestStats ||
      current.bestScore > bestStats.bestScore ||
      (current.bestScore === bestStats.bestScore && current.bestTimeSeconds < bestStats.bestTimeSeconds);
    if (!isBetter) {
      return;
    }
    setBestStats(current);
    localStorage.setItem(`quiz-best-${statsKey}`, JSON.stringify(current));
  }, [bestStats, elapsedTime, finished, quizQuestions.length, score, statsKey]);

  if (!quizQuestions.length) {
    return <section className="panel">Nenhuma pergunta cadastrada.</section>;
  }

  return (
    <section className="panel">
      <div className="row between">
        <strong>Tempo: {Math.max(0, timeLeft)}s</strong>
        <strong>
          Pergunta {Math.min(index + 1, quizQuestions.length)}/{quizQuestions.length}
        </strong>
        <strong>
          Melhor: {bestStats ? `${bestStats.bestScore}% em ${bestStats.bestTimeSeconds}s` : "sem recorde"}
        </strong>
      </div>
      {!finished && question ? (
        <article className="stack">
          <h3>{question.title}</h3>
          <div className={`stack ${feedback ? styles.feedbackState : ""}`}>
            {feedback ? (
              <p className={`${styles.feedbackBanner} ${feedback === "correct" ? styles.ok : styles.fail}`}>
                {feedback === "correct" ? "Acertou! Boa resposta." : "Errou! Vamos para a proxima."}
              </p>
            ) : null}
            {question.options.map((opt, optIndex) => (
              <button
                key={`${question.id}-${optIndex}`}
                className={`btn-secondary quiz-option ${styles.quizOption} ${
                  lockedOption === optIndex ? (feedback === "correct" ? `correct ${styles.correct}` : `wrong ${styles.wrong}`) : ""
                }`}
                onClick={() => onAnswer(optIndex)}
                disabled={lockedOption !== null}
              >
                {opt}
              </button>
            ))}
          </div>
        </article>
      ) : (
        <article className="stack">
          <h3>Resultado final</h3>
          <p>Acerto: {score}%</p>
          <p>Tempo: {elapsedTime}s</p>
          <p>Melhor tempo: {bestStats ? `${bestStats.bestTimeSeconds}s` : "sem recorde"}</p>
          <Link href="/" className="btn-secondary btn-back">
            Voltar para /
          </Link>
        </article>
      )}
    </section>
  );
}
