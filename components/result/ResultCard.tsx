import type { CSSProperties } from "react";
import Link from "next/link";
import type { PlayerRecord } from "@/types/game";
import BackHomeButton from "@/components/common/BackHomeButton";
import FireworksAnimation from "@/components/result/FireworksAnimation";
import styles from "./ResultCard.module.css";

type Props = {
  participant: PlayerRecord;
};

const gameLabels = {
  memory: "Jogo da Memória",
  quiz: "Quiz"
} as const;

function ResultRibbon({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`${styles.resultRibbon} ${position === "top" ? styles.topRibbon : styles.bottomRibbon}`} aria-hidden="true">
      <div>
        <span>Cooperar é coisa nossa! * vem pra coop! * </span>
        <span>Cooperar é coisa nossa! * vem pra coop! * </span>
        <span>Cooperar é coisa nossa! * vem pra coop! * </span>
      </div>
    </div>
  );
}

export default function ResultCard({ participant }: Props) {
  const totalItems = participant.game === "quiz" ? 5 : 10;
  const itemLabel = participant.game === "quiz" ? "perguntas" : "pares";
  const percent = Math.round((participant.score / totalItems) * 100);
  const progressStyle = { "--progress": `${percent * 3.6}deg` } as CSSProperties;

  if (participant.game === "quiz" || participant.game === "memory") {
    return (
      <>
        <BackHomeButton game={participant.game} />
        <section className={styles.quizResult}>
          <ResultRibbon position="top" />
          <ResultRibbon position="bottom" />
          <div className={styles.quizResultContent}>
            <h1>Resultado</h1>
            <div className={styles.progressRing} style={progressStyle}>
              <span>{percent}%</span>
            </div>
            <p>
              Você acertou {participant.score} de {totalItems} {itemLabel}!
            </p>
            <strong>
              {participant.wonPrize
                ? "Parabéns! Você ganhou um brinde."
                : participant.game === "quiz"
                  ? "A partir de 3 acertos ganha brinde."
                  : "A partir de 5 acertos ganha brinde."}
            </strong>
            <Link href="/" className={styles.resultButton}>
              Voltar ao início
            </Link>
            <Link href="/form" className={`${styles.resultButton} ${styles.altButton}`}>
              Novo Jogo
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <BackHomeButton game={participant.game} />
      <section className={`${styles.card} ${participant.wonPrize ? styles.win : styles.loss}`}>
        {participant.wonPrize ? <FireworksAnimation /> : null}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Resultado final</p>
          <h1>
            {participant.wonPrize
              ? "Parabéns! Você ganhou um brinde!"
              : "Sua participação foi concluída. Continue com a gente nas próximas experiências."}
          </h1>
        </div>
        <div className={styles.grid}>
          <article>
            <span>Jogador</span>
            <strong>{participant.fullName}</strong>
          </article>
          <article>
            <span>Acertos</span>
            <strong>{participant.score}</strong>
          </article>
          <article>
            <span>Jogo</span>
            <strong>{gameLabels[participant.game]}</strong>
          </article>
          <article>
            <span>Status</span>
            <strong>{participant.wonPrize ? "Ganhou brinde" : "Participação concluída"}</strong>
          </article>
        </div>
      </section>
    </>
  );
}
