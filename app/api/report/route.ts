import { NextResponse } from "next/server";
import { buildDashboardSummary } from "@/services/server/report";
import { getParticipants } from "@/services/server/storage";
import type { PlayerRecord } from "@/types/game";

export async function GET() {
  let participants: PlayerRecord[] = [];

  try {
    participants = await getParticipants();
  } catch {
    participants = [];
  }

  const summary = buildDashboardSummary(participants);
  return NextResponse.json({ summary, participants: participants.slice(0, 10) });
}
