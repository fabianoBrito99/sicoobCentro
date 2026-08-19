"use client";

import { Project } from "@/lib/schemas/project";

type Props = {
  project: Project;
  onChange: (project: Project) => void;
};

export default function WordSearchEditor({ project, onChange }: Props) {
  const game = project.games.wordsearch;
  return (
    <section className="panel">
      <h3>Ca&ccedil;a-palavras</h3>
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
                  wordsearch: { ...game, timeLimitSeconds: Number(e.target.value) || 120 }
                }
              })
            }
          />
        </label>
        <label>
          Grid size
          <input
            className="input"
            type="number"
            min={6}
            max={20}
            value={game.gridSize}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  wordsearch: { ...game, gridSize: Number(e.target.value) || 10 }
                }
              })
            }
          />
        </label>
        <label>
          Palavras no facil
          <input
            className="input"
            type="number"
            min={1}
            value={game.wordsPerDifficulty.easy}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  wordsearch: {
                    ...game,
                    wordsPerDifficulty: {
                      ...game.wordsPerDifficulty,
                      easy: Number(e.target.value) || 5
                    }
                  }
                }
              })
            }
          />
        </label>
        <label>
          Palavras no medio
          <input
            className="input"
            type="number"
            min={1}
            value={game.wordsPerDifficulty.medium}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  wordsearch: {
                    ...game,
                    wordsPerDifficulty: {
                      ...game.wordsPerDifficulty,
                      medium: Number(e.target.value) || 10
                    }
                  }
                }
              })
            }
          />
        </label>
        <label>
          Palavras no dificil
          <input
            className="input"
            type="number"
            min={1}
            value={game.wordsPerDifficulty.hard}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  wordsearch: {
                    ...game,
                    wordsPerDifficulty: {
                      ...game.wordsPerDifficulty,
                      hard: Number(e.target.value) || 15
                    }
                  }
                }
              })
            }
          />
        </label>
      </div>
      <label className="toggle-row">
        <span>Permitir diagonais</span>
        <input
          type="checkbox"
          checked={game.allowDiagonals}
          onChange={(e) =>
            onChange({
              ...project,
              games: {
                ...project.games,
                wordsearch: { ...game, allowDiagonals: e.target.checked }
              }
            })
          }
        />
      </label>
      <label>
        Palavras (uma por linha)
        <textarea
          className="textarea"
          rows={6}
          value={game.words.join("\n")}
          onChange={(e) =>
            onChange({
              ...project,
              games: {
                ...project.games,
                wordsearch: {
                  ...game,
                  words: e.target.value
                    .split("\n")
                    .map((word) => word.trim())
                    .filter(Boolean)
                }
              }
            })
          }
        />
      </label>
    </section>
  );
}
