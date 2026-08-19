import { createSign } from "node:crypto";
import type { PlayerRecord } from "@/types/game";
import { onlyDigits } from "@/utils/masks";

type FirebaseServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
  token_uri: string;
};

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
};

type AccessTokenCache = {
  token: string;
  expiresAt: number;
} | null;

const firestoreScope = "https://www.googleapis.com/auth/datastore";
const participantsCollection = process.env.FIREBASE_PARTICIPANTS_COLLECTION ?? "campaignParticipants";
let accessTokenCache: AccessTokenCache = null;

function buildParticipantDocumentId(cpf: string, game: PlayerRecord["game"]): string {
  return `${game}_${onlyDigits(cpf)}`;
}

function getFirebaseConfig(): FirebaseServiceAccount | null {
  const raw = process.env.FIREBASE_ADMIN_KEY?.trim();
  if (!raw) {
    return null;
  }

  const parseConfig = (value: string): FirebaseServiceAccount | null => {
    try {
      return JSON.parse(value) as FirebaseServiceAccount;
    } catch {
      return null;
    }
  };

  const parsed = parseConfig(raw) ?? parseConfig(Buffer.from(raw, "base64").toString("utf8"));
  if (!parsed) {
    console.error("firebase-config-invalid");
    return null;
  }

  try {
    return {
      ...parsed,
      private_key: parsed.private_key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n")
    };
  } catch {
    console.error("firebase-config-read-failed");
    return null;
  }
}

function hasFirebaseConfig(): boolean {
  return getFirebaseConfig() !== null;
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(): Promise<string | null> {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (accessTokenCache && accessTokenCache.expiresAt > now + 60) {
    return accessTokenCache.token;
  }

  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = toBase64Url(
    JSON.stringify({
      iss: config.client_email,
      scope: firestoreScope,
      aud: config.token_uri,
      iat: now,
      exp: now + 3600
    })
  );
  const unsignedJwt = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer.sign(config.private_key, "base64url");

  const response = await fetch(config.token_uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedJwt}.${signature}`
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Firebase token request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token: string; expires_in: number };
  accessTokenCache = {
    token: payload.access_token,
    expiresAt: now + payload.expires_in
  };
  return payload.access_token;
}

function getFirestoreBaseUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

async function firebaseRequest<T>(path: string, init?: RequestInit): Promise<T | null> {
  const config = getFirebaseConfig();
  const token = await getAccessToken();
  if (!config || !token) {
    return null;
  }

  const response = await fetch(`${getFirestoreBaseUrl(config.project_id)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Firebase request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

function playerRecordToFirestoreFields(record: PlayerRecord): Record<string, FirestoreValue> {
  return {
    id: { stringValue: record.id },
    fullName: { stringValue: record.fullName },
    cpf: { stringValue: record.cpf },
    phone: { stringValue: record.phone },
    email: { stringValue: record.email },
    consentAccepted: { booleanValue: record.consentAccepted },
    game: { stringValue: record.game },
    score: { integerValue: String(record.score) },
    wonPrize: { booleanValue: record.wonPrize },
    playedAt: { stringValue: record.playedAt },
    consentAcceptedAt: { stringValue: record.consentAcceptedAt }
  };
}

function readStringField(fields: Record<string, FirestoreValue> | undefined, key: string): string {
  const value = fields?.[key];
  return value && "stringValue" in value ? value.stringValue : "";
}

function readBooleanField(fields: Record<string, FirestoreValue> | undefined, key: string): boolean {
  const value = fields?.[key];
  return value && "booleanValue" in value ? value.booleanValue : false;
}

function readIntegerField(fields: Record<string, FirestoreValue> | undefined, key: string): number {
  const value = fields?.[key];
  return value && "integerValue" in value ? Number(value.integerValue) : 0;
}

function firestoreDocumentToPlayerRecord(document: FirestoreDocument): PlayerRecord {
  const fields = document.fields;
  return {
    id: readStringField(fields, "id"),
    fullName: readStringField(fields, "fullName"),
    cpf: readStringField(fields, "cpf"),
    phone: readStringField(fields, "phone"),
    email: readStringField(fields, "email"),
    consentAccepted: readBooleanField(fields, "consentAccepted"),
    game: readStringField(fields, "game") as PlayerRecord["game"],
    score: readIntegerField(fields, "score"),
    wonPrize: readBooleanField(fields, "wonPrize"),
    playedAt: readStringField(fields, "playedAt"),
    consentAcceptedAt: readStringField(fields, "consentAcceptedAt")
  };
}

export async function saveParticipantToFirebase(record: PlayerRecord): Promise<PlayerRecord | null> {
  if (!hasFirebaseConfig()) {
    return null;
  }

  const documentId = buildParticipantDocumentId(record.cpf, record.game);

  await firebaseRequest<FirestoreDocument>(`/${participantsCollection}/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: playerRecordToFirestoreFields(record)
    })
  });

  return record;
}

export async function getFirebaseParticipants(): Promise<PlayerRecord[] | null> {
  if (!hasFirebaseConfig()) {
    return null;
  }

  const allParticipants: PlayerRecord[] = [];
  let nextPageToken = "";

  do {
    const query = nextPageToken ? `?pageToken=${encodeURIComponent(nextPageToken)}` : "";
    const response = await firebaseRequest<FirestoreListResponse>(`/${participantsCollection}${query}`);
    if (!response?.documents?.length) {
      break;
    }

    allParticipants.push(...response.documents.map(firestoreDocumentToPlayerRecord));
    nextPageToken = response.nextPageToken ?? "";
  } while (nextPageToken);

  return allParticipants.sort((a, b) => b.playedAt.localeCompare(a.playedAt));
}

export async function getFirebaseParticipantById(id: string): Promise<PlayerRecord | null> {
  if (!hasFirebaseConfig()) {
    return null;
  }

  const participants = await getFirebaseParticipants();
  if (!participants) {
    return null;
  }

  return participants.find((participant) => participant.id === id) ?? null;
}

export async function getFirebaseParticipantByCpfGame(
  cpf: string,
  game: PlayerRecord["game"]
): Promise<PlayerRecord | null> {
  if (!hasFirebaseConfig()) {
    return null;
  }

  const documentId = buildParticipantDocumentId(cpf, game);
  const document = await firebaseRequest<FirestoreDocument>(`/${participantsCollection}/${documentId}`);
  return document ? firestoreDocumentToPlayerRecord(document) : null;
}

export async function clearFirebaseParticipants(): Promise<void> {
  const participants = await getFirebaseParticipants();
  if (!participants?.length) {
    return;
  }

  await Promise.all(
    participants.map((participant) =>
      firebaseRequest<null>(`/${participantsCollection}/${participant.id}`, { method: "DELETE" })
    )
  );
}

export function isFirebaseSyncEnabled(): boolean {
  return hasFirebaseConfig();
}
