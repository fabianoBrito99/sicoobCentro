"use client";

import { useEffect, useState } from "react";
import type { MemoryCardItem } from "@/utils/memory";
import { buildMemoryDeck } from "@/utils/memory";
import MemoryCard from "@/components/memory/MemoryCard";
import styles from "./MemoryBoard.module.css";

type Props = {
  onScoreChange: (score: number) => void;
  onFinish: (score: number) => void;
  disabled: boolean;
};

export default function MemoryBoard({ onScoreChange, onFinish, disabled }: Props) {
  const [deck, setDeck] = useState<MemoryCardItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  useEffect(() => {
    setDeck(buildMemoryDeck());
  }, []);

  useEffect(() => {
    onScoreChange(matchedPairs.length);
    if (matchedPairs.length === 10) {
      onFinish(10);
    }
  }, [matchedPairs.length, onFinish, onScoreChange, matchedPairs]);

  const handleClick = (card: MemoryCardItem) => {
    if (disabled || selected.includes(card.id) || matchedPairs.includes(card.pairKey) || selected.length === 2) {
      return;
    }
    const nextSelected = [...selected, card.id];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const [firstId, secondId] = nextSelected;
      const first = deck.find((item) => item.id === firstId);
      const second = deck.find((item) => item.id === secondId);
      if (first && second && first.pairKey === second.pairKey) {
        window.setTimeout(() => {
          setMatchedPairs((current) => [...current, first.pairKey]);
          setSelected([]);
        }, 350);
      } else {
        window.setTimeout(() => setSelected([]), 800);
      }
    }
  };

  return (
    <div className={styles.grid}>
      {deck.map((card) => (
        <MemoryCard
          key={card.id}
          image={card.image}
          flipped={selected.includes(card.id) || matchedPairs.includes(card.pairKey)}
          matched={matchedPairs.includes(card.pairKey)}
          onClick={() => handleClick(card)}
        />
      ))}
    </div>
  );
}
