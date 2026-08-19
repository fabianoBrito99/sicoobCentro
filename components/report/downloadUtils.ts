import { buildCsv, buildExcelXml } from "@/services/server/report";
import type { PlayerRecord } from "@/types/game";

const browserStorageKey = "campaign-pwa-browser-storage";

export function getBrowserParticipants(): PlayerRecord[] {
  const raw = window.localStorage.getItem(browserStorageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as { participants?: PlayerRecord[] };
    return Array.isArray(parsed.participants) ? parsed.participants : [];
  } catch {
    return [];
  }
}

function downloadBlob(content: BlobPart, type: string, fileName: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcel(participants: PlayerRecord[]): void {
  downloadBlob(buildExcelXml(participants), "application/vnd.ms-excel;charset=utf-8", "participantes.xls");
}

export function downloadCsv(participants: PlayerRecord[]): void {
  downloadBlob(buildCsv(participants), "text/csv;charset=utf-8", "participantes.csv");
}
