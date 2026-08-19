import { z } from "zod";

export const ThemeSchema = z.object({
  background: z.object({
    type: z.enum(["solid", "gradient"]),
    color: z.string().default("#0f172a"),
    colors: z.array(z.string()).default(["#0f172a", "#1e293b"]),
    angle: z.number().min(0).max(360).default(135)
  }),
  logo: z.object({
    path: z.string().optional(),
    position: z.enum(["top", "center", "bottom"]).default("top"),
    align: z.enum(["left", "center", "right"]).default("center"),
    size: z.number().min(40).max(400).default(160)
  }),
  ui: z.object({
    primary: z.string().default("#f97316"),
    text: z.string().default("#f8fafc"),
    cardBg: z.string().default("#1e293b"),
    cardRadius: z.number().min(4).max(40).default(20)
  }),
  home: z.object({
    title: z.string().min(1).default("Bem-vindo"),
    subtitle: z.string().optional(),
    showResultsBadge: z.boolean().default(true)
  })
});

export type Theme = z.infer<typeof ThemeSchema>;

export const defaultTheme: Theme = {
  background: {
    type: "gradient",
    color: "#0f172a",
    colors: ["#0f172a", "#1e293b"],
    angle: 135
  },
  logo: {
    position: "top",
    align: "center",
    size: 160
  },
  ui: {
    primary: "#f97316",
    text: "#f8fafc",
    cardBg: "#1e293b",
    cardRadius: 20
  },
  home: {
    title: "Jogos Interativos",
    subtitle: "Escolha um desafio para começar",
    showResultsBadge: true
  }
};
