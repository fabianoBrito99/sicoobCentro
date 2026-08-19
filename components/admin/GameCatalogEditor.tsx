"use client";

import { Project } from "@/lib/schemas/project";

type Props = {
  project: Project;
  onChange: (project: Project) => void;
};

function GameToggle({
  title,
  enabled,
  onToggle
}: {
  title: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{title}</span>
      <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
    </label>
  );
}

export default function GameCatalogEditor({ project, onChange }: Props) {
  return (
    <section className="panel">
      <h3>Catalogo de jogos</h3>
      <div className="stack">
        <GameToggle
          title="Jogo da Memoria"
          enabled={project.games.memory.enabled}
          onToggle={(enabled) =>
            onChange({ ...project, games: { ...project.games, memory: { ...project.games.memory, enabled } } })
          }
        />
        <GameToggle
          title="Labirinto"
          enabled={project.games.maze.enabled}
          onToggle={(enabled) =>
            onChange({ ...project, games: { ...project.games, maze: { ...project.games.maze, enabled } } })
          }
        />
        <GameToggle
          title="Caca-Palavras"
          enabled={project.games.wordsearch.enabled}
          onToggle={(enabled) =>
            onChange({
              ...project,
              games: { ...project.games, wordsearch: { ...project.games.wordsearch, enabled } }
            })
          }
        />
        <GameToggle
          title="Quiz"
          enabled={project.games.quiz.enabled}
          onToggle={(enabled) =>
            onChange({ ...project, games: { ...project.games, quiz: { ...project.games.quiz, enabled } } })
          }
        />
        <GameToggle
          title="Termo"
          enabled={project.games.termo.enabled}
          onToggle={(enabled) =>
            onChange({ ...project, games: { ...project.games, termo: { ...project.games.termo, enabled } } })
          }
        />
        <GameToggle
          title="Forca"
          enabled={project.games.forca.enabled}
          onToggle={(enabled) =>
            onChange({ ...project, games: { ...project.games, forca: { ...project.games.forca, enabled } } })
          }
        />
      </div>
    </section>
  );
}
