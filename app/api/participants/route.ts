import { NextResponse } from "next/server";
import type { GameType, PlayerFormData, PlayerRecord } from "@/types/game";
import { getParticipants, saveParticipant, getParticipantByCpfGame } from "@/services/server/storage";
import { isValidCpf, isValidEmail, isValidFullName, isValidPhone } from "@/utils/validators";

type ParticipantPayload = PlayerFormData & {
  game: GameType;
  score: number;
  id?: string;
  playedAt?: string;
  wonPrize?: boolean;
  consentAcceptedAt?: string;
};

export async function GET() {
  let participants: PlayerRecord[] = [];

  try {
    participants = await getParticipants();
  } catch {
    participants = [];
  }

  return NextResponse.json(participants);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ParticipantPayload;

  if (
    !isValidFullName(body.fullName) ||
    !isValidCpf(body.cpf) ||
    !isValidPhone(body.phone) ||
    !isValidEmail(body.email) ||
    !body.consentAccepted ||
    (body.game !== "memory" && body.game !== "wordsearch")
  ) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const record: PlayerRecord = {
    id: body.id ?? crypto.randomUUID(),
    fullName: body.fullName.trim(),
    cpf: body.cpf,
    phone: body.phone,
    email: body.email.trim(),
    consentAccepted: true,
    game: body.game,
    score: body.score,
    wonPrize: body.wonPrize ?? body.score >= 5,
    playedAt: body.playedAt ?? new Date().toISOString(),
    consentAcceptedAt: body.consentAcceptedAt ?? new Date().toISOString()
  };

  try {
    const existing = await getParticipantByCpfGame(record.cpf, record.game);
    if (existing) {
      return NextResponse.json(existing, { status: 409 });
    }

    const saved = await saveParticipant(record);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("participant-save-failed", error);
    return NextResponse.json({ error: "Nao foi possivel sincronizar o participante agora." }, { status: 503 });
  }
}
