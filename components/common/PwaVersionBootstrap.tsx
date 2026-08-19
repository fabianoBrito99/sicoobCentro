"use client";

import { useEffect } from "react";
import { clearStaticAssets } from "@/utils/staticAsset";
import { OFFLINE_DISMISSED_KEY, OFFLINE_STATUS_KEY } from "@/utils/offlineStatus";

const VERSION_KEY = "campaign-pwa-version";
const RELOAD_KEY = "campaign-pwa-version-reload";
const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "local-shell-v1";

export default function PwaVersionBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const previousVersion = window.localStorage.getItem(VERSION_KEY);
    if (previousVersion === currentVersion) {
      window.sessionStorage.removeItem(RELOAD_KEY);
      return;
    }

    const refreshPwa = async () => {
      window.localStorage.setItem(VERSION_KEY, currentVersion);
      window.localStorage.removeItem(OFFLINE_STATUS_KEY);
      window.localStorage.removeItem(OFFLINE_DISMISSED_KEY);
      clearStaticAssets();

      if ("caches" in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if (window.sessionStorage.getItem(RELOAD_KEY) !== currentVersion) {
        window.sessionStorage.setItem(RELOAD_KEY, currentVersion);
        window.location.reload();
      }
    };

    void refreshPwa();
  }, []);

  return null;
}
