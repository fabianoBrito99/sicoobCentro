"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameFrame from "@/components/common/GameFrame";
import WordSearchBoard from "@/components/wordsearch/WordSearchBoard";
import WordList from "@/components/wordsearch/WordList";
import { fetchWordSearchPuzzle, saveParticipantRecord } from "@/services/client/api";
import type { WordSearchPuzzle } from "@/types/wordsearch";
import { clearPlayerSession, loadPlayerSession, saveLastResultParticipantId } from "@/utils/session";
import styles from "./WordSearchGameScreen.module.css";

export default function WordSearchGameScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [locked, setLocked] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);

  useEffect(() => {
    const session = loadPlayerSession();
    if (!session || session.game !== "wordsearch") {
      router.replace("/form");
      return;
    }

    void router.prefetch("/resultado");

    const loadPuzzle = async () => {
      const data = await fetchWordSearchPuzzle();
      setPuzzle(data);
    };
    void loadPuzzle();

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
      game: "wordsearch",
      score: finalScore
    });
    saveLastResultParticipantId(participant.id);
    clearPlayerSession();
    router.replace("/resultado");
  };

  if (!puzzle) {
    return (
      <GameFrame title="Caça-palavras" subtitle="Preparando a grade do jogo..." secondsLeft={60} score={0}>
        <div className={styles.loading}>Carregando puzzle...</div>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      title="Caça-palavras"
      subtitle="Selecione palavras horizontais e verticais com toque ou mouse."
      secondsLeft={secondsLeft}
      score={score}
    >
      <div className={styles.layout}>
        <WordSearchBoard
          puzzle={puzzle}
          onScoreChange={setScore}
          onFoundWordsChange={setFoundWords}
          onFinish={finishGame}
          disabled={locked || secondsLeft === 0}
        />
        <WordList words={puzzle.words} foundWords={foundWords} />
      </div>
    </GameFrame>
  );
}
