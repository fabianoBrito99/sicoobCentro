"use client";

import { useEffect, useMemo, useState } from "react";
import AssetsUploader from "@/components/admin/AssetsUploader";
import GameCatalogEditor from "@/components/admin/GameCatalogEditor";
import MazeEditor from "@/components/admin/MazeEditor";
import ProjectPreview from "@/components/admin/ProjectPreview";
import QuizEditor from "@/components/admin/QuizEditor";
import ThemeEditor from "@/components/admin/ThemeEditor";
import WordSearchEditor from "@/components/admin/WordSearchEditor";
import { ActiveSchema, Project, ProjectSchema, createDefaultProject } from "@/lib/schemas/project";
import { createProjectId } from "@/lib/utils/id";
import { deletePath, list, readJson, writeJson } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
};

const activePath = (tenant: string) => `tenants/${tenant}/active.json`;
const projectPath = (tenant: string, projectId: string) =>
  `tenants/${tenant}/projects/${projectId}/project.json`;

export default function ProjectManager({ tenant }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const enabledCount = useMemo(() => {
    if (!project) return 0;
    return ["memory", "maze", "wordsearch", "quiz", "termo", "forca"].filter(
      (name) => project.games[name as keyof Project["games"]].enabled
    ).length;
  }, [project]);

  const loadActive = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const activeRaw = await readJson<unknown>(activePath(tenant));
      const activeParsed = activeRaw ? ActiveSchema.safeParse(activeRaw) : null;
      if (!activeParsed || !activeParsed.success) {
        setProject(null);
        return;
      }
      const pRaw = await readJson<unknown>(projectPath(tenant, activeParsed.data.activeProjectId));
      const pParsed = pRaw ? ProjectSchema.safeParse(pRaw) : null;
      if (!pParsed || !pParsed.success) {
        setProject(null);
        return;
      }
      setProject(pParsed.data);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadActive();
  }, [tenant]);

  const createNewProject = async () => {
    setSaving(true);
    try {
      const projectId = createProjectId();
      const next = createDefaultProject(tenant, projectId);
      await writeJson(projectPath(tenant, projectId), next);
      await writeJson(activePath(tenant), {
        activeProjectId: projectId,
        updatedAt: new Date().toISOString()
      });
      setProject(next);
      setMessage(`Projeto ${projectId} criado.`);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveCurrent = async (status: "draft" | "published" = "draft") => {
    if (!project) return;
    setSaving(true);
    try {
      const parsed = ProjectSchema.parse({ ...project, status });
      await writeJson(projectPath(tenant, project.projectId), parsed);
      await writeJson(activePath(tenant), {
        activeProjectId: project.projectId,
        updatedAt: new Date().toISOString()
      });
      setProject(parsed);
      setMessage(`Projeto salvo como ${status}.`);
      return true;
    } catch (e) {
      setMessage((e as Error).message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const keepOnlyLatestThree = async () => {
    const projectEntries = await list(`tenants/${tenant}/projects`);
    const items: Array<{ projectId: string; createdAt: string }> = [];

    for (const entry of projectEntries) {
      if (entry.kind !== "directory") continue;
      const data = await readJson<unknown>(projectPath(tenant, entry.name));
      if (!data) continue;
      const parsed = ProjectSchema.safeParse(data);
      if (!parsed.success) continue;
      items.push({ projectId: parsed.data.projectId, createdAt: parsed.data.createdAt });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const toDelete = items.slice(3);
    for (const item of toDelete) {
      await deletePath(`tenants/${tenant}/projects/${item.projectId}`);
    }
  };

  const publish = async () => {
    const saved = await saveCurrent("published");
    if (!saved) return;
    await keepOnlyLatestThree();
    setMessage("Projeto publicado e politica keep=3 aplicada.");
  };

  if (loading) {
    return <section className="panel">Carregando projeto ativo...</section>;
  }

  return (
    <div className="stack">
      <section className="panel">
        <div className="row between">
          <div>
            <h2>Tenant: {tenant}</h2>
            {project ? (
              <p>
                Projeto ativo: <strong>{project.name}</strong> ({project.status}) | Jogos habilitados:{" "}
                {enabledCount}
              </p>
            ) : (
              <p>Nenhum projeto ativo encontrado.</p>
            )}
          </div>
          <button className="btn-primary" onClick={() => void createNewProject()} disabled={saving}>
            Criar novo projeto
          </button>
        </div>
      </section>

      {!project ? null : (
        <>
          <ThemeEditor value={project.theme} onChange={(theme) => setProject({ ...project, theme })} />
          <section className="panel">
            <h3>Dados do projeto</h3>
            <label>
              Nome do projeto
              <input
                className="input"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value || "Projeto sem nome" })}
              />
            </label>
          </section>
          <ProjectPreview tenant={tenant} project={project} />

          <section className="panel">
            <h3>Memory</h3>
            <div className="grid-two">
              <label>
                Tempo (s)
                <input
                  className="input"
                  type="number"
                  value={project.games.memory.timeLimitSeconds}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        memory: {
                          ...project.games.memory,
                          timeLimitSeconds: Number(e.target.value) || 90
                        }
                      }
                    })
                  }
                />
              </label>
              <label>
                Pares
                <input
                  className="input"
                  type="number"
                  min={2}
                  max={18}
                  value={project.games.memory.pairs}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        memory: {
                          ...project.games.memory,
                          pairs: Number(e.target.value) || 6
                        }
                      }
                    })
                  }
                />
              </label>
            </div>
          </section>

          <GameCatalogEditor project={project} onChange={setProject} />
          <AssetsUploader tenant={tenant} project={project} onChange={setProject} />
          <MazeEditor project={project} onChange={setProject} />
          <WordSearchEditor project={project} onChange={setProject} />
          <QuizEditor project={project} onChange={setProject} />

          <section className="panel">
            <h3>Termo</h3>
            <div className="grid-two">
              <label>
                Tempo (s)
                <input
                  className="input"
                  type="number"
                  value={project.games.termo.timeLimitSeconds}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        termo: { ...project.games.termo, timeLimitSeconds: Number(e.target.value) || 120 }
                      }
                    })
                  }
                />
              </label>
              <label>
                Tamanho da palavra
                <input
                  className="input"
                  type="number"
                  min={4}
                  max={8}
                  value={project.games.termo.wordLength}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        termo: { ...project.games.termo, wordLength: Number(e.target.value) || 5 }
                      }
                    })
                  }
                />
              </label>
              <label>
                Tentativas maximas
                <input
                  className="input"
                  type="number"
                  min={4}
                  max={10}
                  value={project.games.termo.maxAttempts}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        termo: { ...project.games.termo, maxAttempts: Number(e.target.value) || 6 }
                      }
                    })
                  }
                />
              </label>
            </div>
            <label>
              Palavras do termo (uma por linha)
              <textarea
                className="textarea"
                rows={6}
                value={project.games.termo.words.join("\n")}
                onChange={(e) =>
                  setProject({
                    ...project,
                    games: {
                      ...project.games,
                      termo: {
                        ...project.games.termo,
                        words: e.target.value
                          .split("\n")
                          .map((v) => v.trim())
                          .filter(Boolean)
                      }
                    }
                  })
                }
              />
            </label>
          </section>

          <section className="panel">
            <h3>Forca</h3>
            <div className="grid-two">
              <label>
                Tempo (s)
                <input
                  className="input"
                  type="number"
                  value={project.games.forca.timeLimitSeconds}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        forca: { ...project.games.forca, timeLimitSeconds: Number(e.target.value) || 120 }
                      }
                    })
                  }
                />
              </label>
              <label>
                Erros maximos
                <input
                  className="input"
                  type="number"
                  min={3}
                  max={10}
                  value={project.games.forca.maxErrors}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      games: {
                        ...project.games,
                        forca: { ...project.games.forca, maxErrors: Number(e.target.value) || 6 }
                      }
                    })
                  }
                />
              </label>
            </div>
            <label>
              Palavras da forca (uma por linha)
              <textarea
                className="textarea"
                rows={6}
                value={project.games.forca.words.join("\n")}
                onChange={(e) =>
                  setProject({
                    ...project,
                    games: {
                      ...project.games,
                      forca: {
                        ...project.games.forca,
                        words: e.target.value
                          .split("\n")
                          .map((v) => v.trim())
                          .filter(Boolean)
                      }
                    }
                  })
                }
              />
            </label>
          </section>

          <section className="row">
            <button className="btn-secondary" onClick={() => void saveCurrent("draft")} disabled={saving}>
              Salvar draft
            </button>
            <button className="btn-primary" onClick={() => void publish()} disabled={saving}>
              Publicar
            </button>
          </section>
        </>
      )}
      {message ? <p className="info-text">{message}</p> : null}
    </div>
  );
}
