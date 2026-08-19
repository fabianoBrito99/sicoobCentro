"use client";

const STATIC_ASSETS_KEY = "campaign-pwa-static-assets";
const STATIC_ASSET_EVENT = "campaign-pwa-static-asset-change";

type StaticAssetMap = Record<string, string>;

function readStaticAssetMap(): StaticAssetMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STATIC_ASSETS_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as StaticAssetMap;
  } catch {
    return {};
  }
}

function writeStaticAssetMap(map: StaticAssetMap): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STATIC_ASSETS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(STATIC_ASSET_EVENT));
}

export function saveStaticAsset(path: string, dataUrl: string): void {
  const map = readStaticAssetMap();
  writeStaticAssetMap({
    ...map,
    [path]: dataUrl
  });
}

export function getStaticAsset(path: string): string | null {
  const map = readStaticAssetMap();
  return map[path] ?? null;
}

export function clearStaticAssets(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STATIC_ASSETS_KEY);
  window.dispatchEvent(new CustomEvent(STATIC_ASSET_EVENT));
}

export { STATIC_ASSET_EVENT };
