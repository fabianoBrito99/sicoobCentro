"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Project, ProjectSchema } from "@/lib/schemas/project";
import { ensurePermission, getRootHandle, list, readJson } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
};

export default function TenantHomeClient({ tenant }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const root = await getRootHandle();
        if (!root) {
          setError("Pasta de dados nao encontrada. Abra /admin/{tenant} para selecionar.");
          return;
        }
        const hasRead = await ensurePermission(root, "read");
        if (!hasRead) {
          setError("Permissao de leitura negada.");
          return;
        }

        const entries = await list(`tenants/${tenant}/projects`);
        const loaded: Project[] = [];
        for (const entry of entries) {
          if (entry.kind !== "directory") continue;
          const raw = await readJson<unknown>(`tenants/${tenant}/projects/${entry.name}/project.json`);
          const parsed = ProjectSchema.safeParse(raw);
          if (!parsed.success) continue;
          loaded.push(parsed.data);
        }
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setProjects(loaded);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenant]);

  if (loading) {
    return <main className="page-wrap">Carregando projetos...</main>;
  }
  if (error) {
    return <main className="page-wrap">{error}</main>;
  }

  return (
    <main className="page-wrap">
      <section className="panel centered stack">
        <h1>Meus jogos</h1>
        <p>Escolha um projeto para entrar.</p>
        <div className="game-grid">
          {projects.map((project) => (
            <Link key={project.projectId} href={`/m/${tenant}/project/${project.projectId}`} className="game-card">
              <h3>{project.name}</h3>
              <p>Status: {project.status}</p>
            </Link>
          ))}
        </div>
        {!projects.length ? <p>Nenhum projeto encontrado para este tenant.</p> : null}
      </section>
    </main>
  );
}
