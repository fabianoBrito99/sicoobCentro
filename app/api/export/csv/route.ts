import type { PlayerRecord } from "@/types/game";
import { getParticipants } from "@/services/server/storage";
import { buildCsv } from "@/services/server/report";

export async function GET() {
  let participants: PlayerRecord[] = [];

  try {
    participants = await getParticipants();
  } catch {
    participants = [];
  }

  const csv = buildCsv(participants);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="participantes.csv"'
    }
  });
}
