"use client";

import styles from "./DownloadExcelButton.module.css";
import { downloadExcel, getBrowserParticipants } from "./downloadUtils";

export default function DownloadExcelButton() {
  const handleDownload = async () => {
    const browserParticipants = getBrowserParticipants();
    if (browserParticipants.length > 0) {
      downloadExcel(browserParticipants);
      return;
    }

    try {
      const response = await fetch("/api/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "participantes.xls";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fallback local abaixo
    }

    downloadExcel(browserParticipants);
  };

  return (
    <button type="button" className={styles.button} onClick={() => void handleDownload()}>
      Baixar Excel
    </button>
  );
}
