"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackHomeButton from "@/components/common/BackHomeButton";
import { useOfflineAssetSrc } from "@/lib/hooks/useOfflineAssetSrc";
import { quizQuestions } from "@/data/quiz";
import { saveParticipantRecord } from "@/services/client/api";
import { clearPlayerSession, loadPlayerSession, saveLastResultParticipantId } from "@/utils/session";
import styles from "./QuizGameScreen.module.css";

export default function QuizGameScreen() {
  const router = useRouter();
  const logoSrc = useOfflineAssetSrc("/logo.png");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const question = quizQuestions[index];

  useEffect(() => {
    const session = loadPlayerSession();
    if (!session || session.game !== "quiz") {
      router.replace("/form");
      return;
    }

    void router.prefetch("/resultado");

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router]);

  useEffect(() => {
    if (secondsLeft !== 0 || locked) {
      return;
    }

    void finishGame(score);
  }, [locked, score, secondsLeft]);

  const finishGame = async (finalScore: number) => {
    if (locked) {
      return;
    }

    const session = loadPlayerSession();
    if (!session) {
      router.replace("/form");
      return;
    }

    setLocked(true);
    const participant = await saveParticipantRecord({
      ...session.player,
      game: "quiz",
      score: finalScore
    });
    saveLastResultParticipantId(participant.id);
    clearPlayerSession();
    router.replace("/resultado");
  };

  const handleAnswer = (optionIndex: number) => {
    if (locked || selectedOption !== null || !question) {
      return;
    }

    const isCorrect = optionIndex === question.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;
    setSelectedOption(optionIndex);
    setFeedback(isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
      if (index >= quizQuestions.length - 1) {
        void finishGame(nextScore);
        return;
      }

      setScore(nextScore);
      setIndex((current) => current + 1);
      setSelectedOption(null);
      setFeedback(null);
    }, 900);
  };

  return (
    <main className={styles.page}>
      <BackHomeButton game="quiz" />
      <section className={styles.quiz}>
        <div className={styles.logoPanel}>
          <img src={logoSrc} alt="Sicoob Centro" className={styles.logo} />
        </div>

        <div className={styles.progressTrack}>
          <span style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} />
        </div>

        <div className={styles.statusRow}>
          <strong>
            Pergunta {index + 1}/{quizQuestions.length}
          </strong>
          <strong>{secondsLeft}s</strong>
          <strong>{score} acertos</strong>
        </div>

        <article className={styles.questionCard}>
          <h1 className={styles.questionTitle}>{question.title}</h1>
        </article>

        <div className={styles.options}>
          {question.options.map((option, optionIndex) => {
            const selected = selectedOption === optionIndex;
            const stateClass = selected ? (feedback === "correct" ? styles.correct : styles.wrong) : "";

            return (
              <button
                key={`${question.id}-${optionIndex}`}
                type="button"
                className={`${styles.option} ${stateClass}`.trim()}
                onClick={() => handleAnswer(optionIndex)}
                disabled={selectedOption !== null || locked || secondsLeft === 0}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
