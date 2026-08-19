import { NextResponse } from "next/server";
import { buildWordSearch, getWordSetKey, pickWords } from "@/utils/wordsearch";
import { getLastWordSetKey, setLastWordSetKey } from "@/services/server/storage";

export async function GET() {
  let lastKey: string | null = null;

  try {
    lastKey = await getLastWordSetKey();
  } catch {
    lastKey = null;
  }

  const words = pickWords(lastKey);
  const puzzle = buildWordSearch(words);

  try {
    await setLastWordSetKey(getWordSetKey(words));
  } catch {
    // Quando nao houver persistencia no servidor, o cliente assume o controle.
  }

  return NextResponse.json(puzzle);
}
