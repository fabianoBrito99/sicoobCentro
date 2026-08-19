"use client";

import { useEffect, useState } from "react";
import { getFile } from "@/lib/storage/localFsAccess";

export function useLocalObjectUrl(
  tenant: string,
  projectId: string,
  relativePath?: string
): { url: string | null; loading: boolean; error: string | null } {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    const run = async () => {
      if (!relativePath) {
        setUrl(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const path = `tenants/${tenant}/projects/${projectId}/${relativePath}`;
        const file = await getFile(path);
        objectUrl = URL.createObjectURL(file);
        if (active) {
          setUrl(objectUrl);
        }
      } catch (e) {
        if (active) {
          setError((e as Error).message);
          setUrl(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [tenant, projectId, relativePath]);

  return { url, loading, error };
}
