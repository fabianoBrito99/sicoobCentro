"use client";

import { useRouter } from "next/navigation";
import { updateDailyGame } from "@/services/client/api";
import type { GameType } from "@/types/game";
import styles from "./BackHomeButton.module.css";

type Props = {
  label?: string;
  game?: GameType;
};

export default function BackHomeButton({ label = "Voltar para a tela inicial", game }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => {
        const navigate = async () => {
          if (game) {
            await updateDailyGame(game);
          }

          router.push("/");
        };

        void navigate();
      }}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">&#8592;</span>
    </button>
  );
}
