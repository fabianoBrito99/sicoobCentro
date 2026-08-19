"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ForcaGame from "@/components/games/forca/ForcaGame";
import MazeGame from "@/components/games/maze/MazeGame";
import MemoryGame from "@/components/games/memory/MemoryGame";
import QuizGame from "@/components/games/quiz/QuizGame";
import TermoGame from "@/components/games/termo/TermoGame";
import WordSearchGame from "@/components/games/wordsearch/WordSearchGame";
import { ActiveSchema, Project, ProjectSchema, createDefaultProject } from "@/lib/schemas/project";
import { ensurePermission, getRootHandle, readJson } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
};

type GameKey = "memory" | "maze" | "wordsearch" | "quiz" | "termo" | "forca";
type Level = "easy" | "medium" | "hard";

const memoryFallbackImages = [
  "/1.jpg",
   "/2.jpg",
    "/3.jpg",
     "/4.jpg",
      "/6.jpg"];

export default function TenantPlayClient({ tenant }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const rawGame = searchParams.get("g") ?? "memory";
  const rawLevel = searchParams.get("level") ?? "medium";
  const selectedProjectId = searchParams.get("p");
  const game = (
    ["memory", "maze", "wordsearch", "quiz", "termo", "forca"].includes(rawGame) ? rawGame : "memory"
  ) as GameKey;
  const level = (["easy", "medium", "hard"].includes(rawLevel) ? rawLevel : "medium") as Level;
  const isDemo = tenant === "demo";
  const pulseLayers = Array.from({ length: 5 }, (_, i) => i);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (isDemo) {
        setProject(createDefaultProject("demo", "catalog-demo"));
        setLoading(false);
        return;
      }
      try {
        const root = await getRootHandle();
        if (!root) {
          setError("Pasta de dados nao configurada.");
          return;
        }
        const hasRead = await ensurePermission(root, "read");
        if (!hasRead) {
          setError("Permissao de leitura negada.");
          return;
        }
        const activeRaw = await readJson<unknown>(`tenants/${tenant}/active.json`);
        const active = ActiveSchema.safeParse(activeRaw);
        if (!active.success) {
          setError("active.json nao encontrado.");
          return;
        }
        const projectId = selectedProjectId ?? active.data.activeProjectId;
        const pRaw = await readJson<unknown>(`tenants/${tenant}/projects/${projectId}/project.json`);
        const parsed = ProjectSchema.safeParse(pRaw);
        if (!parsed.success) {
          setError("project.json invalido.");
          return;
        }
        setProject(parsed.data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isDemo, selectedProjectId, tenant]);

  useEffect(() => {
    void document.documentElement.requestFullscreen?.();
  }, []);

  const timeScale = level === "easy" ? 1.1 : level === "hard" ? 0.85 : 1;
  const difficultyMultiplier = level === "easy" ? 0 : level === "medium" ? 1 : 2;
  const sessionKey = useMemo(() => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);

  if (loading) return <main className="page-wrap">Carregando jogo...</main>;
  if (error || !project) return <main className="page-wrap">{error ?? "Projeto nao encontrado."}</main>;
  const enabled = project.games[game]?.enabled;
  const memoryImages = project.games.memory.images.length ? project.games.memory.images : memoryFallbackImages;

  const memoryPairs = Math.max(
    2,
    Math.min(
      memoryImages.length || project.games.memory.pairs,
      level === "easy"
        ? Math.max(2, project.games.memory.pairs - 2)
        : level === "hard"
        ? project.games.memory.pairs + 2
        : project.games.memory.pairs
    )
  );

  const memoryTime =
    isDemo && level === "hard" ? 40 : Math.max(20, Math.round(project.games.memory.timeLimitSeconds * timeScale));
  const mazeTime =
    isDemo && level === "hard" ? 20 : Math.max(20, Math.round(project.games.maze.timeLimitSeconds * timeScale));
  const wordTime =
    isDemo && level === "hard"
      ? 40
      : Math.max(20, Math.round(project.games.wordsearch.timeLimitSeconds * timeScale));
  const quizTime =
    isDemo && level === "hard" ? 40 : Math.max(20, Math.round(project.games.quiz.timeLimitSeconds * timeScale));
  const termoTime =
    isDemo && level === "hard" ? 40 : Math.max(20, Math.round(project.games.termo.timeLimitSeconds * timeScale));
  const forcaTime =
    isDemo && level === "hard" ? 40 : Math.max(20, Math.round(project.games.forca.timeLimitSeconds * timeScale));

  return (
    <main className="catalog-shell">
      <section className="catalog-hero catalog-surface centered stack">
        <div className="catalog-pulse">
          {pulseLayers.map((layer) => (
            <span key={layer} className={`catalog-pulse-wave ${layer % 2 ? "alt" : ""}`} />
          ))}
          <strong className="vibra-mark">
            <span className="vibra-word">
              <span className="vibra-v">V</span>ibra
            </span>
            <span className="vibra-sub">Producoes</span>
          </strong>
        </div>
      </section>

      <div className="game-only-screen">
        {!enabled ? <div className="panel centered">Jogo desabilitado para este tenant.</div> : null}
        {enabled && game === "memory" ? (
          <MemoryGame
            tenant={tenant}
            projectId={project.projectId}
            timeLimitSeconds={memoryTime}
            pairs={memoryPairs}
            images={memoryImages}
          />
        ) : null}
        {enabled && game === "maze" ? (
          <MazeGame size={project.games.maze.size} difficulty={level} timeLimitSeconds={mazeTime} />
        ) : null}
        {enabled && game === "wordsearch" ? (
          <WordSearchGame
            gridSize={project.games.wordsearch.gridSize}
            words={project.games.wordsearch.words}
            wordsPerDifficulty={project.games.wordsearch.wordsPerDifficulty}
            difficulty={level}
            allowDiagonals={project.games.wordsearch.allowDiagonals}
            timeLimitSeconds={wordTime}
          />
        ) : null}
        {enabled && game === "quiz" ? (
          <QuizGame
            questions={project.games.quiz.questions}
            timeLimitSeconds={quizTime}
            mode={project.games.quiz.mode}
            statsKey={`${tenant}-${project.projectId}-${level}`}
            sessionKey={sessionKey}
          />
        ) : null}
        {enabled && game === "termo" ? (
          <TermoGame
            words={project.games.termo.words}
            timeLimitSeconds={termoTime}
            wordLength={Math.max(4, project.games.termo.wordLength + difficultyMultiplier)}
            maxAttempts={project.games.termo.maxAttempts}
            sessionKey={sessionKey}
          />
        ) : null}
        {enabled && game === "forca" ? (
          <ForcaGame
            words={project.games.forca.words}
            timeLimitSeconds={forcaTime}
            maxErrors={Math.max(3, project.games.forca.maxErrors - difficultyMultiplier)}
            sessionKey={sessionKey}
          />
        ) : null}
      </div>
    </main>
  );
}
