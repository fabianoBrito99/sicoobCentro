"use client";

import { useEffect } from "react";
import { syncPendingParticipants } from "@/services/client/api";

export default function PendingSyncBootstrap() {
  useEffect(() => {
    const runSync = () => {
      void syncPendingParticipants();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runSync();
      }
    };

    runSync();

    const interval = window.setInterval(runSync, 30000);
    window.addEventListener("online", runSync);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", runSync);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
