"use client";

import { usePathname } from "next/navigation";
import FormPageClient from "@/components/forms/FormPageClient";
import HomeExperience from "@/components/home/HomeExperience";
import MemoryGameScreen from "@/components/memory/MemoryGameScreen";
import RelatorioView from "@/components/report/RelatorioView";
import ResultadoView from "@/components/result/ResultadoView";
import WordSearchGameScreen from "@/components/wordsearch/WordSearchGameScreen";

export default function OfflineRouteShell() {
  const pathname = usePathname();

  if (pathname === "/form") {
    return <FormPageClient initialGame={null} />;
  }

  if (pathname === "/game/memory") {
    return <MemoryGameScreen />;
  }

  if (pathname === "/game/wordsearch") {
    return <WordSearchGameScreen />;
  }

  if (pathname === "/resultado") {
    return <ResultadoView participantId="" />;
  }

  if (pathname === "/relatorio") {
    return <RelatorioView />;
  }

  return <HomeExperience />;
}
