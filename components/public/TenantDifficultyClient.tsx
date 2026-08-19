"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ActiveSchema, Project, ProjectSchema, createDefaultProject } from "@/lib/schemas/project";
import { ensurePermission, getRootHandle, readJson } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
};

type GameKey = "memory" | "maze" | "wordsearch" | "quiz" | "termo" | "forca";
type Level = "easy" | "medium" | "hard";

const labels: Record<GameKey, string> = {
  memory: "Jogo da Memoria",
  maze: "Labirinto",
  wordsearch: "Caca-Palavras",
  quiz: "Quiz",
  termo: "Termo",
  forca: "Forca"
};

export default function TenantDifficultyClient({ tenant }: Props) {
  const params = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rawGame = params.get("g") ?? "memory";
  const selectedProjectId = params.get("p");
  const game = (Object.keys(labels).includes(rawGame) ? rawGame : "memory") as GameKey;
  const isDemo = tenant === "demo";

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

  const levels: Array<{ id: Level; label: string; hint: string }> = [
    { id: "easy", label: "Facil", hint: "Mais tempo e ritmo suave" },
    { id: "medium", label: "Medio", hint: "Ritmo balanceado para evento" },
    { id: "hard", label: "Dificil", hint: "Tempo curto para desafio real" }
  ];
  const pulseLayers = Array.from({ length: 5 }, (_, i) => i);

  if (loading) {
    return <main className="page-wrap">Carregando dificuldade...</main>;
  }
  if (error || !project) {
    return <main className="page-wrap">{error ?? "Projeto nao encontrado."}</main>;
  }

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
        <h2>{labels[game]}</h2>
        <p>Selecione a dificuldade e inicie a experiencia.</p>
      </section>

      <section className="catalog-surface centered stack">
        <div className="game-grid">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/m/${tenant}/play?g=${game}&level=${level.id}&p=${project.projectId}`}
              className={`game-card touch-card difficulty-card difficulty-${level.id}`}
            >
              <h3>{level.label}</h3>
              <p>{level.hint}</p>
            </Link>
          ))}
        </div>
        <Link href="/" className="btn-secondary btn-back">
          Voltar ao catalogo
        </Link>
      </section>
    </main>
  );
}
