import { NextResponse } from "next/server";
import { clearAllData } from "@/services/server/storage";

export async function DELETE() {
  try {
    await clearAllData();
  } catch {
    // O cliente tambem limpa seu fallback local.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("campaign_daily_game", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
