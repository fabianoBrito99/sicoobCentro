"use client";

import { resetCampaignData } from "@/services/client/api";
import styles from "./ResetDataButton.module.css";

type Props = {
  onReset: () => void;
};

export default function ResetDataButton({ onReset }: Props) {
  const handleReset = async () => {
    const confirmed = window.confirm(
      "Tem certeza? Isso vai apagar todos os dados salvos e reiniciar o sistema do zero."
    );

    if (!confirmed) {
      return;
    }

    await resetCampaignData();
    onReset();
  };

  return (
    <button type="button" className={styles.button} onClick={() => void handleReset()}>
      Apagar dados
    </button>
  );
}
