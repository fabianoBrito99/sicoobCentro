"use client";

export type OfflineCacheStatus = "idle" | "warming" | "ready" | "error";

export type OfflineProgress = {
  status: OfflineCacheStatus;
  completed: number;
  total: number;
};

export const OFFLINE_STATUS_KEY = "campaign-pwa-offline-status";
export const OFFLINE_DISMISSED_KEY = "campaign-pwa-offline-dismissed";
export const OFFLINE_STATUS_EVENT = "campaign-pwa-offline-status-change";

const defaultProgress: OfflineProgress = {
  status: "idle",
  completed: 0,
  total: 0
};

export function readOfflineProgress(): OfflineProgress {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  const raw = window.localStorage.getItem(OFFLINE_STATUS_KEY);
  if (!raw) {
    return defaultProgress;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OfflineProgress>;
    const status = parsed.status;
    if (status !== "idle" && status !== "warming" && status !== "ready" && status !== "error") {
      return defaultProgress;
    }

    return {
      status,
      completed: typeof parsed.completed === "number" ? parsed.completed : 0,
      total: typeof parsed.total === "number" ? parsed.total : 0
    };
  } catch {
    return defaultProgress;
  }
}

export function writeOfflineProgress(progress: OfflineProgress): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OFFLINE_STATUS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent(OFFLINE_STATUS_EVENT, { detail: progress }));
}

export function isOfflineNoticeDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(OFFLINE_DISMISSED_KEY) === "1";
}

export function dismissOfflineNotice(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OFFLINE_DISMISSED_KEY, "1");
}

export function resetOfflineNotice(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(OFFLINE_DISMISSED_KEY);
}
