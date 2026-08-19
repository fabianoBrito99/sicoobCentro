import { buildDashboardSummary } from "@/services/server/report";
import type { DashboardSummary, DailyGameSelection, GameType, PlayerFormData, PlayerRecord } from "@/types/game";
import type { WordSearchPuzzle } from "@/types/wordsearch";
import { getTodayKey } from "@/utils/date";
import { onlyDigits } from "@/utils/masks";
import { buildWordSearch, getWordSetKey, pickWords } from "@/utils/wordsearch";

type DailyGameResponse = { dailyGame: DailyGameSelection | null };
type ReportResponse = { summary: DashboardSummary; participants: PlayerRecord[] };
type BrowserStorage = {
  dailyGame: DailyGameSelection | null;
  participants: PlayerRecord[];
  pendingParticipants: PlayerRecord[];
  lastWordSetKey: string | null;
};
type SafeApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

const BROWSER_STORAGE_KEY = "campaign-pwa-browser-storage";
const PLAYER_SESSION_KEY = "campanha-player-session";
const RESET_MARKER_KEY = "campaign-pwa-reset-marker";
const defaultBrowserStorage: BrowserStorage = {
  dailyGame: null,
  participants: [],
  pendingParticipants: [],
  lastWordSetKey: null
};

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readBrowserStorage(): BrowserStorage {
  if (!canUseBrowserStorage()) {
    return defaultBrowserStorage;
  }

  const raw = window.localStorage.getItem(BROWSER_STORAGE_KEY);
  if (!raw) {
    return defaultBrowserStorage;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BrowserStorage>;
    return {
      dailyGame: parsed.dailyGame ?? null,
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      pendingParticipants: Array.isArray(parsed.pendingParticipants) ? parsed.pendingParticipants : [],
      lastWordSetKey: parsed.lastWordSetKey ?? null
    };
  } catch {
    return defaultBrowserStorage;
  }
}

function writeBrowserStorage(storage: BrowserStorage): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(BROWSER_STORAGE_KEY, JSON.stringify(storage));
}

function hasResetMarker(): boolean {
  if (!canUseBrowserStorage()) {
    return false;
  }

  return window.localStorage.getItem(RESET_MARKER_KEY) !== null;
}

function clearResetMarker(): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(RESET_MARKER_KEY);
}

function saveDailyGameToBrowser(dailyGame: DailyGameSelection | null): void {
  const storage = readBrowserStorage();
  clearResetMarker();
  writeBrowserStorage({ ...storage, dailyGame });
}

function saveParticipantToBrowser(record: PlayerRecord): void {
  const storage = readBrowserStorage();
  const participants = [record, ...storage.participants.filter((item) => item.id !== record.id)];
  clearResetMarker();
  writeBrowserStorage({ ...storage, participants });
}

function queueParticipantSync(record: PlayerRecord): void {
  const storage = readBrowserStorage();
  const participants = [record, ...storage.participants.filter((item) => item.id !== record.id)];
  const pendingParticipants = [record, ...storage.pendingParticipants.filter((item) => item.id !== record.id)];
  clearResetMarker();
  writeBrowserStorage({ ...storage, participants, pendingParticipants });
}

function markParticipantAsSynced(record: PlayerRecord): void {
  const storage = readBrowserStorage();
  const participants = [record, ...storage.participants.filter((item) => item.id !== record.id)];
  const pendingParticipants = storage.pendingParticipants.filter((item) => item.id !== record.id);
  clearResetMarker();
  writeBrowserStorage({ ...storage, participants, pendingParticipants });
}

function removePendingParticipant(recordId: string): void {
  const storage = readBrowserStorage();
  const pendingParticipants = storage.pendingParticipants.filter((item) => item.id !== recordId);
  clearResetMarker();
  writeBrowserStorage({ ...storage, pendingParticipants });
}

function mergeParticipants(primary: PlayerRecord[], secondary: PlayerRecord[]): PlayerRecord[] {
  const merged = new Map<string, PlayerRecord>();

  for (const item of [...primary, ...secondary]) {
    merged.set(item.id, item);
  }

  return [...merged.values()].sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}

async function flushPendingParticipants(): Promise<void> {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return;
  }

  const storage = readBrowserStorage();
  if (!storage.pendingParticipants.length) {
    return;
  }

  for (const participant of storage.pendingParticipants) {
    const response = await requestJson<PlayerRecord>("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participant)
    });

    if (response.ok && response.data) {
      markParticipantAsSynced(response.data);
      continue;
    }

    if (response.status === 409) {
      if (response.data) {
        markParticipantAsSynced(response.data);
      } else {
        removePendingParticipant(participant.id);
      }
    }
  }
}

export async function syncPendingParticipants(): Promise<void> {
  await flushPendingParticipants();
}

function saveLastWordSetKeyToBrowser(lastWordSetKey: string): void {
  const storage = readBrowserStorage();
  clearResetMarker();
  writeBrowserStorage({ ...storage, lastWordSetKey });
}

function normalizeDailyGameForToday(selection: DailyGameSelection | null): DailyGameSelection | null {
  if (!selection) {
    return null;
  }

  return selection.date === getTodayKey() ? selection : null;
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<SafeApiResponse<T>> {
  try {
    const response = await fetch(input, init);
    const data = await readJsonSafely<T>(response);
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null
    };
  }
}

export async function hasCpfPlayedGame(cpf: string, game: GameType): Promise<boolean> {
  const normalizedCpf = onlyDigits(cpf);
  if (normalizedCpf.length !== 11) {
    return false;
  }

  const localParticipants = readBrowserStorage().participants;
  if (localParticipants.some((item) => onlyDigits(item.cpf) === normalizedCpf && item.game === game)) {
    return true;
  }

  const response = await requestJson<PlayerRecord[]>("/api/participants", { cache: "no-store" });
  if (!response.ok || !response.data) {
    return false;
  }

  return response.data.some((item) => onlyDigits(item.cpf) === normalizedCpf && item.game === game);
}

export async function fetchDailyGame(): Promise<DailyGameSelection | null> {
  void flushPendingParticipants();

  const browserStorageDailyGame = normalizeDailyGameForToday(readBrowserStorage().dailyGame);
  if (hasResetMarker() && !browserStorageDailyGame) {
    return null;
  }

  const response = await requestJson<DailyGameResponse>("/api/settings", { cache: "no-store" });

  if (response.ok && response.data) {
    const normalizedServerDailyGame = normalizeDailyGameForToday(response.data.dailyGame);
    const effectiveDailyGame = normalizedServerDailyGame ?? browserStorageDailyGame;
    saveDailyGameToBrowser(effectiveDailyGame);
    return effectiveDailyGame;
  }

  return browserStorageDailyGame;
}

export async function updateDailyGame(game: GameType): Promise<DailyGameSelection> {
  void flushPendingParticipants();

  const response = await requestJson<DailyGameResponse>("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game })
  });
  const fallbackSelection: DailyGameSelection = {
    date: getTodayKey(),
    game
  };
  const dailyGame = response.ok && response.data?.dailyGame ? response.data.dailyGame : fallbackSelection;
  saveDailyGameToBrowser(dailyGame);
  return dailyGame;
}

export async function resetDailyGame(): Promise<void> {
  await requestJson<{ ok: boolean }>("/api/settings", { method: "DELETE" });
  saveDailyGameToBrowser(null);
}

export async function saveParticipantRecord(
  payload: PlayerFormData & { game: GameType; score: number }
): Promise<PlayerRecord> {
  const localRecord: PlayerRecord = {
    id: crypto.randomUUID(),
    fullName: payload.fullName.trim(),
    cpf: payload.cpf,
    phone: payload.phone,
    email: payload.email.trim(),
    consentAccepted: payload.consentAccepted,
    game: payload.game,
    score: payload.score,
    wonPrize: payload.score >= 5,
    playedAt: new Date().toISOString(),
    consentAcceptedAt: new Date().toISOString()
  };

  queueParticipantSync(localRecord);
  await flushPendingParticipants();

  const refreshedStorage = readBrowserStorage();
  return refreshedStorage.participants.find((item) => item.id === localRecord.id) ?? localRecord;
}

export async function fetchParticipant(id: string): Promise<PlayerRecord | null> {
  const storage = readBrowserStorage();
  const localParticipant = storage.participants.find((item) => item.id === id) ?? null;

  if (localParticipant) {
    return localParticipant;
  }

  if (hasResetMarker()) {
    return null;
  }

  const response = await requestJson<PlayerRecord>(`/api/participants/${id}`, { cache: "no-store" });
  if (response.ok && response.data) {
    saveParticipantToBrowser(response.data);
    return response.data;
  }

  return null;
}

export async function fetchReport(): Promise<ReportResponse> {
  void flushPendingParticipants();

  const storage = readBrowserStorage();
  const localParticipants = storage.participants;

  if (hasResetMarker() && localParticipants.length === 0) {
    return {
      summary: buildDashboardSummary([]),
      participants: []
    };
  }

  const response = await requestJson<ReportResponse>("/api/report", { cache: "no-store" });

  if (response.ok && response.data) {
    const mergedParticipants = mergeParticipants(localParticipants, response.data.participants);

    return {
      summary: buildDashboardSummary(mergedParticipants),
      participants: mergedParticipants.slice(0, 10)
    };
  }

  return {
    summary: buildDashboardSummary(localParticipants),
    participants: localParticipants.slice(0, 10)
  };
}

export async function fetchWordSearchPuzzle(): Promise<WordSearchPuzzle> {
  const response = await requestJson<WordSearchPuzzle>("/api/wordsearch", { cache: "no-store" });
  if (response.ok && response.data) {
    return response.data;
  }

  const storage = readBrowserStorage();
  const words = pickWords(storage.lastWordSetKey);
  const puzzle = buildWordSearch(words);
  saveLastWordSetKeyToBrowser(getWordSetKey(words));
  return puzzle;
}

export async function resetCampaignData(): Promise<void> {
  await requestJson<{ ok: boolean }>("/api/reset", { method: "DELETE" });

  if (!canUseBrowserStorage()) {
    return;
  }

  writeBrowserStorage(defaultBrowserStorage);
  window.localStorage.setItem(RESET_MARKER_KEY, new Date().toISOString());
  window.sessionStorage.removeItem(PLAYER_SESSION_KEY);

  if (typeof window !== "undefined" && "caches" in window) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
  }
}
