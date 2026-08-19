"use client";

import { useEffect } from "react";
import offlineRoutes from "@/config/pwa-routes.json";
import { resetOfflineNotice, writeOfflineProgress } from "@/utils/offlineStatus";
import { saveStaticAsset } from "@/utils/staticAsset";

const PAGE_CACHE = "app-pages";
const IMAGE_CACHE = "images";
const ASSET_CACHE = "http-cache";

function isImagePath(path: string): boolean {
  return /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(path);
}

async function cacheRoute(path: string): Promise<boolean> {
  try {
    const request = new Request(new URL(path, window.location.origin).toString(), {
      cache: "reload",
      credentials: "same-origin",
      mode: "same-origin"
    });
    const response = await fetch(request);

    if (!response.ok) {
      return false;
    }

    const cacheName = isImagePath(path) ? IMAGE_CACHE : path.startsWith("/_next/") ? ASSET_CACHE : PAGE_CACHE;
    const cache = await window.caches.open(cacheName);
    await cache.put(request, response.clone());

    if (isImagePath(path)) {
      const blob = await response.clone().blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : path);
        reader.onerror = () => reject(new Error(`Falha ao converter asset ${path}.`));
        reader.readAsDataURL(blob);
      });

      saveStaticAsset(path, dataUrl);
    }

    return true;
  } catch {
    return false;
  }
}

export default function OfflineAssetsBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return;
    }

    const warmOfflineRoutes = async () => {
      if (!navigator.onLine) {
        return;
      }

      const total = offlineRoutes.length;
      let completed = 0;
      let hasRouteFailure = false;

      writeOfflineProgress({
        status: "warming",
        completed,
        total
      });

      for (const route of offlineRoutes) {
        const cached = await cacheRoute(route);
        if (!cached) {
          hasRouteFailure = true;
        }

        completed += 1;
        writeOfflineProgress({
          status: "warming",
          completed,
          total
        });
      }

      if (hasRouteFailure) {
        writeOfflineProgress({
          status: "error",
          completed,
          total
        });
        return;
      }

      resetOfflineNotice();
      writeOfflineProgress({
        status: "ready",
        completed: total,
        total
      });
    };

    void warmOfflineRoutes();
  }, []);

  return null;
}
