"use client";

import { Project } from "@/lib/schemas/project";

type Props = {
  project: Project;
  onChange: (project: Project) => void;
};

export default function MazeEditor({ project, onChange }: Props) {
  const game = project.games.maze;

  return (
    <section className="panel">
      <h3>Labirinto</h3>
      <div className="grid-two">
        <label>
          Tempo (s)
          <input
            className="input"
            type="number"
            value={game.timeLimitSeconds}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  maze: { ...game, timeLimitSeconds: Number(e.target.value) || 120 }
                }
              })
            }
          />
        </label>
        <label>
          Dificuldade
          <select
            className="input"
            value={game.difficulty}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  maze: { ...game, difficulty: e.target.value as "easy" | "medium" | "hard" }
                }
              })
            }
          >
            <option value="easy">Facil</option>
            <option value="medium">Media</option>
            <option value="hard">Dificil</option>
          </select>
        </label>
        <label>
          Tamanho
          <select
            className="input"
            value={game.size}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  maze: { ...game, size: e.target.value as "S" | "M" | "L" }
                }
              })
            }
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </label>
      </div>
    </section>
  );
}
