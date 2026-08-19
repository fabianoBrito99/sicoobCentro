"use client";

import { useEffect, useState } from "react";
import { getStaticAsset, STATIC_ASSET_EVENT } from "@/utils/staticAsset";

export function useOfflineAssetSrc(path: string): string {
  const [resolvedSrc, setResolvedSrc] = useState(path);

  useEffect(() => {
    const sync = () => {
      setResolvedSrc(getStaticAsset(path) ?? path);
    };

    sync();
    window.addEventListener(STATIC_ASSET_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener(STATIC_ASSET_EVENT, sync as EventListener);
    };
  }, [path]);

  return resolvedSrc;
}
