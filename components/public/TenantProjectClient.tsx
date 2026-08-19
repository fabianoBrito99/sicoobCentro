"use client";

import { useEffect, useState } from "react";
import BrandShell from "@/components/brand/BrandShell";
import ThemeStyle from "@/components/brand/ThemeStyle";
import { Project, ProjectSchema } from "@/lib/schemas/project";
import { ensurePermission, getRootHandle, readJson } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
  projectId: string;
};

export default function TenantProjectClient({ tenant, projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
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
        const projectRaw = await readJson<unknown>(`tenants/${tenant}/projects/${projectId}/project.json`);
        const parsed = ProjectSchema.safeParse(projectRaw);
        if (!parsed.success) {
          setError("Projeto invalido ou ausente.");
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
  }, [projectId, tenant]);

  if (loading) {
    return <main className="page-wrap">Carregando projeto...</main>;
  }
  if (error || !project) {
    return <main className="page-wrap">{error ?? "Projeto nao encontrado."}</main>;
  }

  return (
    <div className="theme-wrap">
      <ThemeStyle theme={project.theme} />
      <BrandShell tenant={tenant} project={project} />
    </div>
  );
}
