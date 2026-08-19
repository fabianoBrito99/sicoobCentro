"use client";

import Link from "next/link";
import { Project } from "@/lib/schemas/project";
import { useLocalObjectUrl } from "@/lib/hooks/useLocalObjectUrl";

type Props = {
  tenant: string;
  project: Project;
  children?: React.ReactNode;
};

const gameLabels = {
  memory: "Jogo da Memoria",
  maze: "Labirinto",
  wordsearch: "Caca-Palavras",
  quiz: "Quiz",
  termo: "Termo",
  forca: "Forca"
} as const;

export default function BrandShell({ tenant, project, children }: Props) {
  const logoPath = project.theme.logo.path;
  const logo = useLocalObjectUrl(tenant, project.projectId, logoPath);

  const enabledGames = (Object.keys(gameLabels) as Array<keyof typeof gameLabels>).filter(
    (key) => project.games[key].enabled
  );

  return (
    <main className="brand-shell" style={{ color: project.theme.ui.text }}>
      <header className="brand-header">
        {logo.url ? (
          <img
            src={logo.url}
            alt="Logo"
            className="brand-logo"
            style={{ width: `${project.theme.logo.size}px` }}
          />
        ) : null}
        <h1>{project.theme.home.title}</h1>
        {project.theme.home.subtitle ? <p>{project.theme.home.subtitle}</p> : null}
      </header>

      {children ?? (
        <section className="game-grid">
          {enabledGames.map((game) => (
            <Link
              key={game}
              className="game-card"
              href={`/m/${tenant}/difficulty?g=${game}&p=${project.projectId}`}
            >
              <h3>{gameLabels[game]}</h3>
              <p>Toque para iniciar</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
