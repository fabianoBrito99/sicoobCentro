import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { DailyGameSelection, GameType } from "@/types/game";
import { getTodayKey } from "@/utils/date";
import { clearDailyGame, getDailyGame, setDailyGame } from "@/services/server/storage";

const dailyGameCookieName = "campaign_daily_game";

async function readDailyGameCookie(): Promise<DailyGameSelection | null> {
  const store = await cookies();
  const raw = store.get(dailyGameCookieName)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DailyGameSelection;
    return parsed.date === getTodayKey() ? parsed : null;
  } catch {
    return null;
  }
}

export async function GET() {
  let dailyGame: DailyGameSelection | null = null;
  const cookieDailyGame = await readDailyGameCookie();

  try {
    dailyGame = await getDailyGame();
  } catch {
    dailyGame = cookieDailyGame;
  }

  if (!dailyGame && cookieDailyGame) {
    dailyGame = cookieDailyGame;
  }

  return NextResponse.json({ dailyGame });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { game?: GameType };
  if (body.game !== "memory" && body.game !== "wordsearch") {
    return NextResponse.json({ error: "Jogo invalido." }, { status: 400 });
  }

  const dailyGame: DailyGameSelection = {
    date: getTodayKey(),
    game: body.game
  };

  try {
    await setDailyGame(dailyGame);
  } catch {
    // Em ambiente serverless sem escrita local, o cookie sustenta a sessao do navegador.
  }

  const response = NextResponse.json({ dailyGame });
  response.cookies.set(dailyGameCookieName, JSON.stringify(dailyGame), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });

  return response;
}

export async function DELETE() {
  try {
    await clearDailyGame();
  } catch {
    // Fluxo resiliente para deploy serverless.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(dailyGameCookieName, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
