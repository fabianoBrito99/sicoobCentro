"use client";

import { openDB } from "idb";

const DB_NAME = "jogos-totem-pwa";
const STORE_NAME = "handles";
const ROOT_KEY = "rootDir";

type PermissionMode = "read" | "readwrite";
type PermissionStateResult = "granted" | "denied" | "prompt";
type PermissionCapableHandle = (
  | FileSystemDirectoryHandle
  | FileSystemFileHandle
) & {
  queryPermission: (descriptor: { mode: PermissionMode }) => Promise<PermissionStateResult>;
  requestPermission: (descriptor: { mode: PermissionMode }) => Promise<PermissionStateResult>;
};

export type LocalEntry = {
  name: string;
  kind: FileSystemHandleKind;
  handle: FileSystemHandle;
};
type IterableDirectoryHandle = FileSystemDirectoryHandle & {
  values: () => AsyncIterable<FileSystemHandle>;
};

const getDb = () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });

const normalize = (path: string) =>
  path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

export const isSupported = () =>
  typeof window !== "undefined" && "showDirectoryPicker" in window;

export async function saveRootHandleToIDB(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, handle, ROOT_KEY);
}

export async function loadRootHandleFromIDB(): Promise<FileSystemDirectoryHandle | null> {
  const db = await getDb();
  const handle = await db.get(STORE_NAME, ROOT_KEY);
  return (handle as FileSystemDirectoryHandle | undefined) ?? null;
}

export async function pickRootHandle(): Promise<FileSystemDirectoryHandle> {
  const picker = (
    window as unknown as Window & {
      showDirectoryPicker: (options: { mode: PermissionMode }) => Promise<FileSystemDirectoryHandle>;
    }
  ).showDirectoryPicker;
  const handle = await picker({ mode: "readwrite" });
  return handle;
}

export async function ensurePermission(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle,
  mode: PermissionMode
): Promise<boolean> {
  const permissionHandle = handle as unknown as PermissionCapableHandle;
  const granted = await permissionHandle.queryPermission({ mode });
  if (granted === "granted") {
    return true;
  }
  const requested = await permissionHandle.requestPermission({ mode });
  return requested === "granted";
}

export async function getRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await loadRootHandleFromIDB();
  if (!handle) {
    return null;
  }
  const ok = await ensurePermission(handle, "read");
  return ok ? handle : null;
}

async function requireRoot(): Promise<FileSystemDirectoryHandle> {
  const handle = await loadRootHandleFromIDB();
  if (!handle) {
    throw new Error("Nenhuma pasta raiz configurada.");
  }
  const ok = await ensurePermission(handle, "readwrite");
  if (!ok) {
    throw new Error("Permissao de leitura/escrita negada para a pasta raiz.");
  }
  return handle;
}

async function resolveDirectory(path: string, create = false): Promise<FileSystemDirectoryHandle> {
  const root = await requireRoot();
  let current = root;
  for (const segment of normalize(path)) {
    current = await current.getDirectoryHandle(segment, { create });
  }
  return current;
}

async function resolveFile(path: string, create = false): Promise<FileSystemFileHandle> {
  const parts = normalize(path);
  if (!parts.length) {
    throw new Error("Path de arquivo invalido.");
  }
  const fileName = parts.pop() as string;
  const folder = parts.join("/");
  const dir = folder ? await resolveDirectory(folder, create) : await requireRoot();
  return dir.getFileHandle(fileName, { create });
}

export async function mkdirp(path: string): Promise<void> {
  await resolveDirectory(path, true);
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  const fh = await resolveFile(path, true);
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
}

export async function readJson<T>(path: string): Promise<T | null> {
  try {
    const fh = await resolveFile(path, false);
    const file = await fh.getFile();
    const text = await file.text();
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return null;
    }
    throw error;
  }
}

export async function list(path: string): Promise<LocalEntry[]> {
  try {
    const dir = path ? await resolveDirectory(path, false) : await requireRoot();
    const iterableDir = dir as unknown as IterableDirectoryHandle;
    const entries: LocalEntry[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const handle of iterableDir.values()) {
      entries.push({ name: handle.name, kind: handle.kind, handle });
    }
    return entries;
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return [];
    }
    throw error;
  }
}

async function deleteHandle(
  directory: FileSystemDirectoryHandle,
  name: string,
  recursive = false
): Promise<void> {
  await directory.removeEntry(name, { recursive });
}

export async function deletePath(path: string): Promise<void> {
  const parts = normalize(path);
  if (!parts.length) {
    return;
  }
  const target = parts.pop() as string;
  const parentPath = parts.join("/");
  try {
    const parent = parentPath ? await resolveDirectory(parentPath, false) : await requireRoot();
    await deleteHandle(parent, target, true);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      return;
    }
    throw error;
  }
}

export async function saveFile(path: string, file: File): Promise<void> {
  const fh = await resolveFile(path, true);
  const writable = await fh.createWritable();
  await writable.write(file);
  await writable.close();
}

export async function getFile(path: string): Promise<File> {
  const fh = await resolveFile(path, false);
  return fh.getFile();
}
