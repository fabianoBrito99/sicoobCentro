import type { GameType } from "@/types/game";

export function hasWonPrize(game: GameType, score: number): boolean {
  if (game === "quiz") {
    return score >= 3;
  }

  return score >= 5;
}
