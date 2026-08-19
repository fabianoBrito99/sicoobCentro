"use client";

import { useEffect, useState } from "react";
import BackgroundMarca from "@/components/layout/BackgroundMarca";
import ResultCard from "@/components/result/ResultCard";
import type { PlayerRecord } from "@/types/game";
import { fetchParticipant } from "@/services/client/api";
import { loadLastResultParticipantId } from "@/utils/session";
import styles from "./ResultadoView.module.css";

type Props = {
  participantId: string;
};

export default function ResultadoView({ participantId }: Props) {
  const [participant, setParticipant] = useState<PlayerRecord | null>(null);

  useEffect(() => {
    const resolvedParticipantId = participantId || loadLastResultParticipantId();
    if (!resolvedParticipantId) {
      return;
    }
    const load = async () => {
      const result = await fetchParticipant(resolvedParticipantId);
      setParticipant(result);
    };
    void load();
  }, [participantId]);

  return (
    <main className={styles.page}>
      <BackgroundMarca />
      {participant ? <ResultCard participant={participant} /> : <div className={styles.loading}>Carregando...</div>}
    </main>
  );
}
