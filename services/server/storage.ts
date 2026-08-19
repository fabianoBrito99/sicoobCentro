import { promises as fs } from "node:fs";
import path from "node:path";
import {
  clearFirebaseParticipants,
  getFirebaseParticipantByCpfGame,
  getFirebaseParticipantById,
  getFirebaseParticipants,
  isFirebaseSyncEnabled,
  saveParticipantToFirebase
} from "@/lib/firebase";
import type { AppStorage, DailyGameSelection, PlayerRecord } from "@/types/game";
import { getTodayKey } from "@/utils/date";
import { onlyDigits } from "@/utils/masks";

const storageFile = path.join(process.cwd(), "data", "storage.json");
const kvStorageKey = process.env.KV_STORAGE_KEY ?? "campaign-storage";
const kvRestApiUrl = process.env.KV_REST_API_URL;
const kvRestApiToken = process.env.KV_REST_API_TOKEN;

const defaultStorage: AppStorage = {
  dailyGame: null,
  participants: [],
  lastWordSetKey: null
};

type KvResponse<T> = {
  result?: T;
};

function isAppStorage(value: unknown): value is AppStorage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AppStorage;
  return Array.isArray(candidate.participants) && "dailyGame" in candidate && "lastWordSetKey" in candidate;
}

function tryRepairStorage(raw: string): AppStorage | null {
  const lastBrace = raw.lastIndexOf("}");
  if (lastBrace < 0) {
    return null;
  }

  const trimmed = raw.slice(0, lastBrace + 1);
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return isAppStorage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hasKvStorage(): boolean {
  return Boolean(kvRestApiUrl && kvRestApiToken);
}

async function requestKv<T>(command: "get" | "set", value?: AppStorage): Promise<T | null> {
  if (!kvRestApiUrl || !kvRestApiToken) {
    return null;
  }

  const encodedKey = encodeURIComponent(kvStorageKey);
  const url =
    command === "get"
      ? `${kvRestApiUrl}/get/${encodedKey}`
      : `${kvRestApiUrl}/set/${encodedKey}/${encodeURIComponent(JSON.stringify(value ?? defaultStorage))}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvRestApiToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`KV request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as KvResponse<T>;
  return payload.result ?? null;
}

async function readKvStorage(): Promise<AppStorage> {
  const result = await requestKv<string>("get");
  if (!result) {
    await writeKvStorage(defaultStorage);
    return defaultStorage;
  }

  try {
    const parsed = JSON.parse(result) as unknown;
    if (isAppStorage(parsed)) {
      return parsed;
    }
  } catch {
    // Continua para resetar a estrutura.
  }

  await writeKvStorage(defaultStorage);
  return defaultStorage;
}

async function writeKvStorage(data: AppStorage): Promise<void> {
  await requestKv<string>("set", data);
}

async function ensureFileStorage(): Promise<void> {
  try {
    await fs.access(storageFile);
  } catch {
    await fs.mkdir(path.dirname(storageFile), { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(defaultStorage, null, 2), "utf8");
  }
}

async function readFileStorage(): Promise<AppStorage> {
  await ensureFileStorage();
  const raw = await fs.readFile(storageFile, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isAppStorage(parsed)) {
      return parsed;
    }
  } catch {
    const repaired = tryRepairStorage(raw);
    if (repaired) {
      await writeFileStorage(repaired);
      return repaired;
    }
  }

  await writeFileStorage(defaultStorage);
  return defaultStorage;
}

async function writeFileStorage(data: AppStorage): Promise<void> {
  await ensureFileStorage();
  await fs.writeFile(storageFile, JSON.stringify(data, null, 2), "utf8");
}

export async function readStorage(): Promise<AppStorage> {
  if (hasKvStorage()) {
    return readKvStorage();
  }

  return readFileStorage();
}

export async function writeStorage(data: AppStorage): Promise<void> {
  if (hasKvStorage()) {
    await writeKvStorage(data);
    return;
  }

  await writeFileStorage(data);
}

export async function getDailyGame(): Promise<DailyGameSelection | null> {
  const storage = await readStorage();
  if (!storage.dailyGame) {
    return null;
  }

  return storage.dailyGame.date === getTodayKey() ? storage.dailyGame : null;
}

export async function setDailyGame(game: DailyGameSelection): Promise<DailyGameSelection> {
  const storage = await readStorage();
  storage.dailyGame = game;
  await writeStorage(storage);
  return game;
}

export async function clearDailyGame(): Promise<void> {
  const storage = await readStorage();
  storage.dailyGame = null;
  await writeStorage(storage);
}

export async function saveParticipant(record: PlayerRecord): Promise<PlayerRecord> {
  if (isFirebaseSyncEnabled()) {
    const saved = await saveParticipantToFirebase(record);
    if (saved) {
      return saved;
    }
  }

  const storage = await readStorage();
  storage.participants = [record, ...storage.participants.filter((item) => item.id !== record.id)];
  await writeStorage(storage);
  return record;
}

export async function getParticipants(): Promise<PlayerRecord[]> {
  if (isFirebaseSyncEnabled()) {
    const participants = await getFirebaseParticipants();
    if (participants) {
      return participants;
    }
  }

  const storage = await readStorage();
  return storage.participants;
}

export async function getParticipantById(id: string): Promise<PlayerRecord | null> {
  if (isFirebaseSyncEnabled()) {
    const participant = await getFirebaseParticipantById(id);
    if (participant) {
      return participant;
    }
  }

  const participants = await getParticipants();
  return participants.find((item) => item.id === id) ?? null;
}

export async function getParticipantByCpfGame(cpf: string, game: PlayerRecord["game"]): Promise<PlayerRecord | null> {
  if (isFirebaseSyncEnabled()) {
    const participant = await getFirebaseParticipantByCpfGame(cpf, game);
    if (participant) {
      return participant;
    }
  }

  const participants = await getParticipants();
  const normalizedCpf = onlyDigits(cpf);
  return participants.find((item) => onlyDigits(item.cpf) === normalizedCpf && item.game === game) ?? null;
}

export async function getLastWordSetKey(): Promise<string | null> {
  const storage = await readStorage();
  return storage.lastWordSetKey;
}

export async function setLastWordSetKey(value: string): Promise<void> {
  const storage = await readStorage();
  storage.lastWordSetKey = value;
  await writeStorage(storage);
}

export async function clearAllData(): Promise<void> {
  if (isFirebaseSyncEnabled()) {
    await clearFirebaseParticipants();
  }

  await writeStorage(defaultStorage);
}
