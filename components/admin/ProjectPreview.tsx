"use client";

import { CSSProperties } from "react";
import { Project } from "@/lib/schemas/project";
import { useLocalObjectUrl } from "@/lib/hooks/useLocalObjectUrl";

type Props = {
  tenant: string;
  project: Project;
};

const labels = {
  memory: "Memoria",
  maze: "Labirinto",
  wordsearch: "Caca-Palavras",
  quiz: "Quiz",
  termo: "Termo",
  forca: "Forca"
} as const;

export default function ProjectPreview({ tenant, project }: Props) {
  const enabledGames = (Object.keys(labels) as Array<keyof typeof labels>).filter(
    (key) => project.games[key].enabled
  );
  const logo = useLocalObjectUrl(tenant, project.projectId, project.theme.logo.path);

  const background =
    project.theme.background.type === "solid"
      ? project.theme.background.color
      : `linear-gradient(${project.theme.background.angle}deg, ${
          project.theme.background.colors[0] ?? project.theme.background.color
        }, ${project.theme.background.colors[1] ?? project.theme.background.color})`;

  return (
    <section className="panel">
      <h3>Preview rapido</h3>
      <div
        className="preview-shell"
        style={
          {
            "--preview-bg": background,
            "--preview-text": project.theme.ui.text,
            "--preview-primary": project.theme.ui.primary,
            "--preview-card-bg": project.theme.ui.cardBg,
            "--preview-radius": `${project.theme.ui.cardRadius}px`
          } as CSSProperties
        }
      >
        <header className="preview-header">
          {logo.url ? (
            <img
              src={logo.url}
              alt="Logo preview"
              className="preview-logo"
              style={{ width: `${Math.min(220, project.theme.logo.size)}px` }}
            />
          ) : null}
          <h4>{project.theme.home.title}</h4>
          {project.theme.home.subtitle ? <p>{project.theme.home.subtitle}</p> : null}
        </header>
        <div className="preview-grid">
          {enabledGames.map((key) => (
            <article key={key} className="preview-card">
              <strong>{labels[key]}</strong>
              <span>Toque para jogar</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
