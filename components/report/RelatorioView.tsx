"use client";

import { useEffect, useState } from "react";
import BackgroundMarca from "@/components/layout/BackgroundMarca";
import LogoHeader from "@/components/common/LogoHeader";
import DashboardResumo from "@/components/report/DashboardResumo";
import DownloadCsvButton from "@/components/report/DownloadCsvButton";
import DownloadExcelButton from "@/components/report/DownloadExcelButton";
import ResetDataButton from "@/components/report/ResetDataButton";
import TabelaParticipantes from "@/components/report/TabelaParticipantes";
import { fetchReport } from "@/services/client/api";
import type { DashboardSummary, PlayerRecord } from "@/types/game";
import styles from "./RelatorioView.module.css";

const emptySummary: DashboardSummary = {
  totalPlayers: 0,
  memoryPlayers: 0,
  wordSearchPlayers: 0,
  bestPrizeGame: "Nenhum",
  averageMemoryScore: 0,
  averageWordSearchScore: 0,
  wins: 0,
  losses: 0,
  memoryConversionRate: 0,
  wordSearchConversionRate: 0
};

export default function RelatorioView() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [participants, setParticipants] = useState<PlayerRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      const report = await fetchReport();
      setSummary(report.summary);
      setParticipants(report.participants);
    };
    void load();
  }, []);

  return (
    <main className={styles.page}>
      <BackgroundMarca />
      <section className={styles.panel}>
        <div className={styles.topbar}>
          <LogoHeader compact />
          <div className={styles.actions}>
            <ResetDataButton
              onReset={() => {
                setSummary(emptySummary);
                setParticipants([]);
              }}
            />
            <DownloadCsvButton />
            <DownloadExcelButton />
          </div>
        </div>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{"Relat\u00F3rio"}</p>
          <h1>Mini dashboard de campanha</h1>
          <p>{"Indicadores consolidados e exporta\u00E7\u00E3o de contatos para Excel e CSV."}</p>
        </div>
        <DashboardResumo summary={summary} />
        <TabelaParticipantes participants={participants} />
      </section>
    </main>
  );
}
