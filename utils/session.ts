import type { GameType, PlayerFormData } from "@/types/game";

const SESSION_KEY = "campanha-player-session";
const PREFERRED_GAME_KEY = "campanha-preferred-game";
const LAST_RESULT_ID_KEY = "campanha-last-result-id";

export type PlayerSession = {
  player: PlayerFormData;
  game: GameType;
};

export function savePlayerSession(session: PlayerSession): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadPlayerSession(): PlayerSession | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PlayerSession;
  } catch {
    return null;
  }
}

export function clearPlayerSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function savePreferredGame(game: GameType): void {
  window.localStorage.setItem(PREFERRED_GAME_KEY, game);
}

export function loadPreferredGame(): GameType | null {
  const value = window.localStorage.getItem(PREFERRED_GAME_KEY);
  return value === "memory" || value === "wordsearch" ? value : null;
}

export function clearPreferredGame(): void {
  window.localStorage.removeItem(PREFERRED_GAME_KEY);
}

export function saveLastResultParticipantId(id: string): void {
  window.sessionStorage.setItem(LAST_RESULT_ID_KEY, id);
}

export function loadLastResultParticipantId(): string {
  return window.sessionStorage.getItem(LAST_RESULT_ID_KEY) ?? "";
}

export function clearLastResultParticipantId(): void {
  window.sessionStorage.removeItem(LAST_RESULT_ID_KEY);
}
