"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocalObjectUrl } from "@/lib/hooks/useLocalObjectUrl";
import { shuffle } from "@/lib/utils/shuffle";

type Props = {
  tenant: string;
  projectId: string;
  timeLimitSeconds: number;
  pairs: number;
  images: string[];
};

type Card = {
  id: string;
  imagePath: string;
  index: number;
};

function MemoryCardFace({
  tenant,
  projectId,
  imagePath
}: {
  tenant: string;
  projectId: string;
  imagePath: string;
}) {
  if (imagePath.startsWith("/")) {
    return <img src={imagePath} alt="Card" />;
  }
  const image = useLocalObjectUrl(tenant, projectId, imagePath);
  if (!image.url) return <span>...</span>;
  return <img src={image.url} alt="Card" />;
}

export default function MemoryGame({ tenant, projectId, timeLimitSeconds, pairs, images }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [finished, setFinished] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    if (!images.length) {
      setCards([]);
      return;
    }
    const limited = shuffle(images).slice(0, pairs);
    const deck = shuffle(
      limited.flatMap((imagePath, index) => [
        { id: `${index}-a`, imagePath, index },
        { id: `${index}-b`, imagePath, index }
      ])
    );
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(timeLimitSeconds);
    setFinished(false);
  }, [images, pairs, timeLimitSeconds]);

  useEffect(() => {
    const raw = localStorage.getItem(`memory-best-${pairs}`);
    const parsed = raw ? Number(raw) : NaN;
    setBestTime(Number.isFinite(parsed) ? parsed : null);
  }, [pairs]);

  useEffect(() => {
    if (finished || !cards.length) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [cards.length, finished, timeLeft]);

  useEffect(() => {
    if (!cards.length) return;
    if (matched.length === cards.length) {
      setFinished(true);
    }
  }, [cards.length, matched.length]);

  const onFlip = (idx: number) => {
    if (finished) return;
    if (flipped.includes(idx) || matched.includes(idx) || flipped.length === 2) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].index === cards[b].index) {
        setMatched((prev) => [...prev, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const progress = useMemo(() => {
    if (!cards.length) return 0;
    return Math.round((matched.length / cards.length) * 100);
  }, [cards.length, matched.length]);
  const won = finished && matched.length === cards.length;
  const elapsedTime = Math.max(0, timeLimitSeconds - Math.max(0, timeLeft));

  useEffect(() => {
    if (!won) return;
    if (bestTime !== null && elapsedTime >= bestTime) return;
    setBestTime(elapsedTime);
    localStorage.setItem(`memory-best-${pairs}`, String(elapsedTime));
  }, [bestTime, elapsedTime, pairs, won]);

  if (!images.length) {
    return <div className="panel">Envie imagens no admin para jogar Memory.</div>;
  }

  return (
    <section className="panel">
      <div className="row between">
        <strong>Tempo: {timeLeft}s</strong>
        <strong>Movimentos: {moves}</strong>
        <strong>Progresso: {progress}%</strong>
      </div>
      <div className="memory-grid">
        {cards.map((card, idx) => {
          const isOpen = flipped.includes(idx) || matched.includes(idx) || finished;
          return (
            <button className="memory-card" key={card.id} onClick={() => onFlip(idx)} type="button">
              {isOpen ? (
                <MemoryCardFace tenant={tenant} projectId={projectId} imagePath={card.imagePath} />
              ) : (
                <span>?</span>
              )}
            </button>
          );
        })}
      </div>
      {finished ? (
        <div className="result-box">
          <p className="info-text">{won ? "Parabens, jogo concluido." : "Tempo esgotado."}</p>
          <p className="info-text">Desempenho: {progress}% | Movimentos: {moves}</p>
          <p className="info-text">Seu tempo: {elapsedTime}s | Melhor tempo: {bestTime ? `${bestTime}s` : "sem recorde"}</p>
          <Link href="/" className="btn-secondary btn-back">
            Voltar para Catalogo
          </Link>
        </div>
      ) : null}
    </section>
  );
}
