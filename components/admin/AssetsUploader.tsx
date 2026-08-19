"use client";

import { Project } from "@/lib/schemas/project";
import { saveFile } from "@/lib/storage/localFsAccess";

type Props = {
  tenant: string;
  project: Project;
  onChange: (project: Project) => void;
};

const extFromName = (name: string) => {
  const clean = name.split(".").pop();
  return clean ? clean.toLowerCase() : "bin";
};

export default function AssetsUploader({ tenant, project, onChange }: Props) {
  const saveLogo = async (file?: File) => {
    if (!file) return;
    const ext = extFromName(file.name);
    const relative = `assets/logo.${ext}`;
    const full = `tenants/${tenant}/projects/${project.projectId}/${relative}`;
    await saveFile(full, file);
    onChange({
      ...project,
      theme: {
        ...project.theme,
        logo: { ...project.theme.logo, path: relative }
      }
    });
  };

  const saveMemoryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const paths: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      const ext = extFromName(f.name);
      const relative = `assets/memory/${i}-${Date.now()}.${ext}`;
      const full = `tenants/${tenant}/projects/${project.projectId}/${relative}`;
      await saveFile(full, f);
      paths.push(relative);
    }
    onChange({
      ...project,
      games: {
        ...project.games,
        memory: {
          ...project.games.memory,
          images: paths
        }
      }
    });
  };

  return (
    <section className="panel">
      <h3>Assets</h3>
      <div className="stack">
        <label>
          Upload logo
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => void saveLogo(e.target.files?.[0])}
          />
        </label>
        <label>
          Upload imagens Memory
          <input
            className="input"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => void saveMemoryImages(e.target.files)}
          />
        </label>
      </div>
    </section>
  );
}
