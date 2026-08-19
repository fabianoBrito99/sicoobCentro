import { getParticipants } from "@/services/server/storage";
import { buildExcelXml } from "@/services/server/report";
import type { PlayerRecord } from "@/types/game";

export async function GET() {
  let participants: PlayerRecord[] = [];

  try {
    participants = await getParticipants();
  } catch {
    participants = [];
  }

  const xml = buildExcelXml(participants);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": 'attachment; filename="participantes.xls"'
    }
  });
}
