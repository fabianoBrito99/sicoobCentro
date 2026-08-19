"use client";

import { usePathname } from "next/navigation";
import FormPageClient from "@/components/forms/FormPageClient";
import HomeExperience from "@/components/home/HomeExperience";
import MemoryGameScreen from "@/components/memory/MemoryGameScreen";
import QuizGameScreen from "@/components/quiz/QuizGameScreen";
import RelatorioView from "@/components/report/RelatorioView";
import ResultadoView from "@/components/result/ResultadoView";

export default function OfflineRouteShell() {
  const pathname = usePathname();

  if (pathname === "/form") {
    return <FormPageClient initialGame={null} />;
  }

  if (pathname === "/game/memory") {
    return <MemoryGameScreen />;
  }

  if (pathname === "/game/quiz") {
    return <QuizGameScreen />;
  }

  if (pathname === "/resultado") {
    return <ResultadoView participantId="" />;
  }

  if (pathname === "/relatorio") {
    return <RelatorioView />;
  }

  return <HomeExperience />;
}
