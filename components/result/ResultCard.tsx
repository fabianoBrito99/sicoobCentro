import type { PlayerRecord } from "@/types/game";
import BackHomeButton from "@/components/common/BackHomeButton";
import FireworksAnimation from "@/components/result/FireworksAnimation";
import styles from "./ResultCard.module.css";

type Props = {
  participant: PlayerRecord;
};

const gameLabels = {
  memory: "Jogo da Mem\u00F3ria",
  wordsearch: "Ca\u00E7a-palavras"
} as const;

export default function ResultCard({ participant }: Props) {
  return (
    <>
      <BackHomeButton game={participant.game} />
      <section className={`${styles.card} ${participant.wonPrize ? styles.win : styles.loss}`}>
        {participant.wonPrize ? <FireworksAnimation /> : null}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Resultado final</p>
          <h1>
            {participant.wonPrize
              ? "Parab\u00E9ns! Voc\u00EA ganhou um brinde!"
              : "Sua participa\u00E7\u00E3o foi conclu\u00EDda. Continue com a gente nas pr\u00F3ximas experi\u00EAncias."}
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
            <strong>{participant.wonPrize ? "Ganhou brinde" : "Participa\u00E7\u00E3o conclu\u00EDda"}</strong>
          </article>
        </div>
      </section>
    </>
  );
}
