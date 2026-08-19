"use client";

import { Project, QuizQuestion } from "@/lib/schemas/project";
import { createQuestionId } from "@/lib/utils/id";

type Props = {
  project: Project;
  onChange: (project: Project) => void;
};

function patchQuestion(
  questions: QuizQuestion[],
  id: string,
  patch: (question: QuizQuestion) => QuizQuestion
) {
  return questions.map((question) => (question.id === id ? patch(question) : question));
}

export default function QuizEditor({ project, onChange }: Props) {
  const game = project.games.quiz;

  const update = (questions: QuizQuestion[], timeLimitSeconds = game.timeLimitSeconds) => {
    onChange({
      ...project,
      games: {
        ...project.games,
        quiz: {
          ...game,
          questions,
          timeLimitSeconds
        }
      }
    });
  };

  return (
    <section className="panel">
      <h3>Quiz</h3>
      <div className="grid-two">
        <label>
          Tempo (s)
          <input
            className="input"
            type="number"
            value={game.timeLimitSeconds}
            onChange={(e) => update(game.questions, Number(e.target.value) || 90)}
          />
        </label>
        <label>
          Modo
          <select
            className="input"
            value={game.mode}
            onChange={(e) =>
              onChange({
                ...project,
                games: {
                  ...project.games,
                  quiz: { ...game, mode: e.target.value as "single" | "multi" }
                }
              })
            }
          >
            <option value="single">Single</option>
            <option value="multi">Multi</option>
          </select>
        </label>
      </div>

      <button
        className="btn-secondary"
        type="button"
        onClick={() =>
          update([
            ...game.questions,
            {
              id: createQuestionId(),
              title: "Nova pergunta",
              options: ["Alternativa 1", "Alternativa 2", "Alternativa 3", "Alternativa 4"],
              correctIndex: 0
            }
          ])
        }
      >
        Nova pergunta
      </button>

      <div className="stack">
        {game.questions.map((q, idx) => (
          <article key={q.id} className="subpanel">
            <label>
              Pergunta {idx + 1}
              <input
                className="input"
                value={q.title}
                onChange={(e) =>
                  update(patchQuestion(game.questions, q.id, (item) => ({ ...item, title: e.target.value })))
                }
              />
            </label>
            <div className="grid-two">
              {q.options.map((opt, optIndex) => (
                <label key={`${q.id}-${optIndex}`}>
                  Op&ccedil;&atilde;o {optIndex + 1}
                  <input
                    className="input"
                    value={opt}
                    onChange={(e) =>
                      update(
                        patchQuestion(game.questions, q.id, (item) => ({
                          ...item,
                          options: item.options.map((o, i) => (i === optIndex ? e.target.value : o))
                        }))
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <div className="row wrap">
              <button
                className="btn-secondary"
                type="button"
                onClick={() =>
                  update(
                    patchQuestion(game.questions, q.id, (item) => ({
                      ...item,
                      options: [...item.options, `Alternativa ${item.options.length + 1}`]
                    }))
                  )
                }
                disabled={q.options.length >= 8}
              >
                Adicionar opcao
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() =>
                  update(
                    patchQuestion(game.questions, q.id, (item) => {
                      if (item.options.length <= 2) return item;
                      const nextOptions = item.options.slice(0, -1);
                      return {
                        ...item,
                        options: nextOptions,
                        correctIndex: Math.min(item.correctIndex, nextOptions.length - 1)
                      };
                    })
                  )
                }
                disabled={q.options.length <= 2}
              >
                Remover ultima opcao
              </button>
            </div>
            <label>
              Indice correto
              <input
                className="input"
                type="number"
                min={0}
                max={q.options.length - 1}
                value={q.correctIndex}
                onChange={(e) =>
                  update(
                    patchQuestion(game.questions, q.id, (item) => ({
                      ...item,
                      correctIndex: Number(e.target.value) || 0
                    }))
                  )
                }
              />
            </label>
            <button
              className="btn-danger"
              type="button"
              onClick={() => update(game.questions.filter((item) => item.id !== q.id))}
            >
              Remover
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
