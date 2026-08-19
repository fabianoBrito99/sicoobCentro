"use client";

import { useEffect } from "react";

type NavigatorStandalone = Navigator & {
  standalone?: boolean;
};

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as NavigatorStandalone).standalone === true
  );
}

export default function PwaRefreshGuard() {
  useEffect(() => {
    if (!isStandaloneMode()) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedRefreshShortcut =
        event.key === "F5" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r");

      if (pressedRefreshShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return null;
}
