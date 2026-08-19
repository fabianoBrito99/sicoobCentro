"use client";

import type { GameType } from "@/types/game";
import BotaoPrimario from "@/components/common/BotaoPrimario";
import styles from "./ModalEscolhaJogoDia.module.css";

type Props = {
  open: boolean;
  onSelect: (game: GameType) => void;
  loading: boolean;
};

export default function ModalEscolhaJogoDia({ open, onSelect, loading }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <p className={styles.eyebrow}>Jogo do dia</p>
        <h2>{"Qual jogo ser\u00E1 exibido hoje?"}</h2>
        <p className={styles.text}>
          Esta escolha fica persistida para que a home mostre apenas o jogo definido no dia.
        </p>
        <div className={styles.actions}>
          <BotaoPrimario onClick={() => onSelect("memory")} disabled={loading} block>
            {"Jogo da Mem\u00F3ria"}
          </BotaoPrimario>
          <button
            className={styles.secondary}
            type="button"
            onClick={() => onSelect("wordsearch")}
            disabled={loading}
          >
            {"Ca\u00E7a-palavras"}
          </button>
        </div>
      </div>
    </div>
  );
}
