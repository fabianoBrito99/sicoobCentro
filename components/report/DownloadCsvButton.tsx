"use client";

import styles from "./DownloadExcelButton.module.css";
import { downloadCsv, getBrowserParticipants } from "./downloadUtils";

export default function DownloadCsvButton() {
  const handleDownload = async () => {
    const browserParticipants = getBrowserParticipants();
    if (browserParticipants.length > 0) {
      downloadCsv(browserParticipants);
      return;
    }

    try {
      const response = await fetch("/api/export/csv");
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "participantes.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback local abaixo
    }

    downloadCsv(browserParticipants);
  };

  return (
    <button type="button" className={styles.button} onClick={() => void handleDownload()}>
      Baixar CSV
    </button>
  );
}
