"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundMarca from "@/components/layout/BackgroundMarca";
import BotaoPrimario from "@/components/common/BotaoPrimario";
import ModalEscolhaJogoDia from "@/components/home/ModalEscolhaJogoDia";
import { fetchDailyGame, resetDailyGame, updateDailyGame } from "@/services/client/api";
import { useOfflineAssetSrc } from "@/lib/hooks/useOfflineAssetSrc";
import type { GameType } from "@/types/game";
import {
  dismissOfflineNotice,
  isOfflineNoticeDismissed,
  OFFLINE_STATUS_EVENT,
  readOfflineProgress,
  type OfflineProgress
} from "@/utils/offlineStatus";
import { savePreferredGame } from "@/utils/session";
import styles from "./HomeExperience.module.css";

const labels: Record<GameType, string> = {
  memory: "Jogo da Memória",
  wordsearch: "Caça-palavras"
};

export default function HomeExperience() {
  const router = useRouter();
  const eventLogoSrc = useOfflineAssetSrc("/logo.png");
  const [dailyGame, setDailyGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState<OfflineProgress>({
    status: "idle",
    completed: 0,
    total: 0
  });
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  const progressPercent = useMemo(() => {
    if (!offlineProgress.total) {
      return 0;
    }

    return Math.min(100, Math.round((offlineProgress.completed / offlineProgress.total) * 100));
  }, [offlineProgress.completed, offlineProgress.total]);

  useEffect(() => {
    const load = async () => {
      const selection = await fetchDailyGame();
      setDailyGame(selection?.game ?? null);
      setShowSelector(!selection?.game);
      setLoading(false);
    };

    void load();
  }, []);

  useEffect(() => {
    const syncNoticeState = () => {
      const progress = readOfflineProgress();
      setOfflineProgress(progress);
      setShowOfflineNotice(
        !isOfflineNoticeDismissed() &&
          (progress.status === "warming" || progress.status === "ready" || progress.status === "error")
      );
    };

    syncNoticeState();

    const handleOfflineStatusChange = () => {
      syncNoticeState();
    };

    window.addEventListener(OFFLINE_STATUS_EVENT, handleOfflineStatusChange as EventListener);
    window.addEventListener("online", handleOfflineStatusChange);

    return () => {
      window.removeEventListener(OFFLINE_STATUS_EVENT, handleOfflineStatusChange as EventListener);
      window.removeEventListener("online", handleOfflineStatusChange);
    };
  }, []);

  useEffect(() => {
    void router.prefetch("/");
    void router.prefetch("/form");
    void router.prefetch("/game/memory");
    void router.prefetch("/game/wordsearch");
    void router.prefetch("/resultado");
    void router.prefetch("/relatorio");

    Array.from({ length: 10 }, (_, index) => `/im${index + 1}.jpeg`).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [router]);

  const handleSelectGame = async (game: GameType) => {
    setSaving(true);
    const selection = await updateDailyGame(game);
    setDailyGame(selection.game);
    setShowSelector(false);
    setSaving(false);
  };

  const handleBackToSelector = async () => {
    setSaving(true);
    await resetDailyGame();
    setDailyGame(null);
    setShowSelector(true);
    setSaving(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgMotion} />
      <div className={styles.noise} />
      <BackgroundMarca />
      <ModalEscolhaJogoDia open={!loading && showSelector} onSelect={handleSelectGame} loading={saving} />

      {showOfflineNotice ? (
        <aside className={`${styles.offlineNotice} ${styles[`offline-${offlineProgress.status}`] ?? ""}`} aria-live="polite">
          <div className={styles.offlineCopy}>
            <strong>
              {offlineProgress.status === "ready"
                ? "Modo offline pronto"
                : offlineProgress.status === "warming"
                  ? "Preparando modo offline"
                  : "Modo offline precisa de atenção"}
            </strong>
            <span>
              {offlineProgress.status === "ready"
                ? `Pacote offline concluído: ${offlineProgress.total} itens salvos.`
                : offlineProgress.status === "warming"
                  ? `Baixando recursos offline: ${offlineProgress.completed}/${offlineProgress.total} itens.`
                  : "Abra o app online por alguns segundos para concluir o cache offline."}
            </span>
            {offlineProgress.total > 0 ? (
              <div className={styles.progressWrap}>
                <div className={styles.progressMeta}>
                  <small>{progressPercent}%</small>
                  <small>
                    {offlineProgress.completed}/{offlineProgress.total}
                  </small>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressBar} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.offlineClose}
            aria-label="Ocultar aviso offline"
            onClick={() => {
              dismissOfflineNotice();
              setShowOfflineNotice(false);
            }}
          >
            ×
          </button>
        </aside>
      ) : null}

      {dailyGame && !showSelector ? (
        <button
          className={styles.backButton}
          type="button"
          onClick={() => void handleBackToSelector()}
          aria-label="Voltar para selecionar o jogo do dia"
          title="Selecionar o jogo do dia"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
      ) : null}

      <div className={styles.center}>
        <div className={styles.badge}>{dailyGame ? labels[dailyGame] : "Defina o jogo do dia"}</div>
        <div className={styles.content}>
          <div className={styles.img}>
            <img src={eventLogoSrc} alt="Logo do evento" className={styles.eventLogo} />
          </div>

          <div className={styles.ctaRow}>
            <BotaoPrimario
              onClick={() => {
                if (dailyGame) {
                  savePreferredGame(dailyGame);
                  router.push("/form");
                }
              }}
              disabled={!dailyGame}
              block
            >
              Iniciar jogo
            </BotaoPrimario>
          </div>
        </div>
      </div>
    </main>
  );
}
