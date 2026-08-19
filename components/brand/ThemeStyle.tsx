"use client";

import { useEffect } from "react";
import { Theme } from "@/lib/schemas/theme";

type Props = {
  theme: Theme;
};

export default function ThemeStyle({ theme }: Props) {
  const gradient = `linear-gradient(${theme.background.angle}deg, ${
    theme.background.colors[0] ?? theme.background.color
  }, ${theme.background.colors[1] ?? theme.background.color})`;
  const background =
    theme.background.type === "solid" ? theme.background.color : gradient;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", theme.ui.primary);
    root.style.setProperty("--brand-text", theme.ui.text);
    root.style.setProperty("--brand-card-bg", theme.ui.cardBg);
    root.style.setProperty("--brand-card-radius", `${theme.ui.cardRadius}px`);
    root.style.setProperty("--brand-background", background);

    return () => {
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-text");
      root.style.removeProperty("--brand-card-bg");
      root.style.removeProperty("--brand-card-radius");
      root.style.removeProperty("--brand-background");
    };
  }, [background, theme.ui.cardBg, theme.ui.cardRadius, theme.ui.primary, theme.ui.text]);

  return null;
}
