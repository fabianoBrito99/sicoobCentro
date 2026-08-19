"use client";

import { Theme } from "@/lib/schemas/theme";

type Props = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

export default function ThemeEditor({ value, onChange }: Props) {
  return (
    <section className="panel">
      <h3>Tema</h3>
      <div className="grid-two">
        <label>
          Titulo home
          <input
            className="input"
            value={value.home.title}
            onChange={(e) =>
              onChange({
                ...value,
                home: { ...value.home, title: e.target.value }
              })
            }
          />
        </label>
        <label>
          Subtitulo home
          <input
            className="input"
            value={value.home.subtitle ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                home: { ...value.home, subtitle: e.target.value }
              })
            }
          />
        </label>
        <label>
          Cor primaria
          <input
            className="input"
            type="color"
            value={value.ui.primary}
            onChange={(e) =>
              onChange({
                ...value,
                ui: { ...value.ui, primary: e.target.value }
              })
            }
          />
        </label>
        <label>
          Cor texto
          <input
            className="input"
            type="color"
            value={value.ui.text}
            onChange={(e) =>
              onChange({
                ...value,
                ui: { ...value.ui, text: e.target.value }
              })
            }
          />
        </label>
        <label>
          Cor card
          <input
            className="input"
            type="color"
            value={value.ui.cardBg}
            onChange={(e) =>
              onChange({
                ...value,
                ui: { ...value.ui, cardBg: e.target.value }
              })
            }
          />
        </label>
        <label>
          Raio do card
          <input
            className="input"
            type="number"
            min={4}
            max={40}
            value={value.ui.cardRadius}
            onChange={(e) =>
              onChange({
                ...value,
                ui: { ...value.ui, cardRadius: Number(e.target.value) || 20 }
              })
            }
          />
        </label>
        <label>
          Fundo
          <select
            className="input"
            value={value.background.type}
            onChange={(e) =>
              onChange({
                ...value,
                background: {
                  ...value.background,
                  type: e.target.value as "solid" | "gradient"
                }
              })
            }
          >
            <option value="solid">Solido</option>
            <option value="gradient">Gradiente</option>
          </select>
        </label>
        <label>
          Cor base
          <input
            className="input"
            type="color"
            value={value.background.color}
            onChange={(e) =>
              onChange({
                ...value,
                background: { ...value.background, color: e.target.value }
              })
            }
          />
        </label>
        <label>
          Cor gradiente 1
          <input
            className="input"
            type="color"
            value={value.background.colors[0] ?? "#0f172a"}
            onChange={(e) =>
              onChange({
                ...value,
                background: {
                  ...value.background,
                  colors: [e.target.value, value.background.colors[1] ?? "#1e293b"]
                }
              })
            }
          />
        </label>
        <label>
          Cor gradiente 2
          <input
            className="input"
            type="color"
            value={value.background.colors[1] ?? "#1e293b"}
            onChange={(e) =>
              onChange({
                ...value,
                background: {
                  ...value.background,
                  colors: [value.background.colors[0] ?? "#0f172a", e.target.value]
                }
              })
            }
          />
        </label>
      </div>
    </section>
  );
}
