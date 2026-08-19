import { NextResponse } from "next/server";
import type { PlayerRecord } from "@/types/game";
import { getParticipantById } from "@/services/server/storage";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  let participant: PlayerRecord | null = null;

  try {
    participant = await getParticipantById(id);
  } catch {
    participant = null;
  }

  if (!participant) {
    return NextResponse.json({ error: "Nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(participant);
}
