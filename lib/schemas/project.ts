import { z } from "zod";
import { ThemeSchema, defaultTheme } from "@/lib/schemas/theme";

export const QuizQuestionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional()
});

export const ProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).default("Projeto sem nome"),
  tenant: z.string(),
  createdAt: z.string().datetime(),
  status: z.enum(["draft", "published"]),
  theme: ThemeSchema,
  games: z.object({
    memory: z.object({
      enabled: z.boolean(),
      timeLimitSeconds: z.number().int().min(10),
      pairs: z.number().int().min(2).max(18),
      images: z.array(z.string()).default([])
    }),
    maze: z.object({
      enabled: z.boolean(),
      timeLimitSeconds: z.number().int().min(10),
      difficulty: z.enum(["easy", "medium", "hard"]),
      size: z.enum(["S", "M", "L"])
    }),
    wordsearch: z
      .object({
        enabled: z.boolean(),
        timeLimitSeconds: z.number().int().min(10),
        gridSize: z.number().int().min(6).max(20),
        words: z.array(z.string().min(1)).default([]),
        wordsPerDifficulty: z
          .object({
            easy: z.number().int().min(1).default(5),
            medium: z.number().int().min(1).default(10),
            hard: z.number().int().min(1).default(15)
          })
          .default({ easy: 5, medium: 10, hard: 15 }),
        allowDiagonals: z.boolean()
      })
      .default({
        enabled: true,
        timeLimitSeconds: 120,
        gridSize: 10,
        words: ["BRASIL", "VIBRA", "ENERGIA", "TOTEM"],
        wordsPerDifficulty: { easy: 5, medium: 10, hard: 15 },
        allowDiagonals: true
      }),
    quiz: z.object({
      enabled: z.boolean(),
      timeLimitSeconds: z.number().int().min(10),
      mode: z.enum(["single", "multi"]),
      questions: z.array(QuizQuestionSchema).default([])
    }),
    termo: z
      .object({
        enabled: z.boolean(),
        timeLimitSeconds: z.number().int().min(10),
        wordLength: z.number().int().min(4).max(8),
        maxAttempts: z.number().int().min(4).max(10),
        words: z.array(z.string().min(1)).default([])
      })
      .default({
        enabled: true,
        timeLimitSeconds: 120,
        wordLength: 5,
        maxAttempts: 6,
        words: ["ENERGIA", "VIBRA", "BRASIL", "TOTEM", "JOGO", "MARCA"]
      }),
    forca: z
      .object({
        enabled: z.boolean(),
        timeLimitSeconds: z.number().int().min(10),
        maxErrors: z.number().int().min(3).max(10),
        words: z.array(z.string().min(1)).default([])
      })
      .default({
        enabled: true,
        timeLimitSeconds: 120,
        maxErrors: 6,
        words: ["ENERGIA", "VIBRA", "LABIRINTO", "QUIZ", "MEMORIA", "TOTEM"]
      })
  })
});

export const ActiveSchema = z.object({
  activeProjectId: z.string(),
  updatedAt: z.string().datetime()
});

export type Project = z.infer<typeof ProjectSchema>;
export type ActiveConfig = z.infer<typeof ActiveSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const createDefaultProject = (tenant: string, projectId: string): Project => ({
  projectId,
  name: `Projeto ${projectId.slice(-6)}`,
  tenant,
  createdAt: new Date().toISOString(),
  status: "draft",
  theme: defaultTheme,
  games: {
    memory: {
      enabled: true,
      timeLimitSeconds: 90,
      pairs: 6,
      images: []
    },
    maze: {
      enabled: true,
      timeLimitSeconds: 120,
      difficulty: "medium",
      size: "M"
    },
    wordsearch: {
      enabled: true,
      timeLimitSeconds: 120,
      gridSize: 10,
      words: ["BRASIL", "VIBRA", "ENERGIA", "TOTEM"],
      wordsPerDifficulty: {
        easy: 5,
        medium: 10,
        hard: 15
      },
      allowDiagonals: true
    },
    quiz: {
      enabled: true,
      timeLimitSeconds: 90,
      mode: "multi",
      questions: [
        {
          id: "q1",
          title: "Qual combinacao traduz melhor a identidade visual da Vibra?",
          options: ["Cinza e bege", "Rosa neon e azul neon", "Verde e marrom", "Preto e branco", "Roxo e prata"],
          correctIndex: 1,
          explanation: "A assinatura da marca usa rosa neon e azul neon."
        },
        {
          id: "q2",
          title: "Onde a logo do cliente deve aparecer no layout final dos jogos?",
          options: [
            "Somente no rodape",
            "Somente na tela de carregamento",
            "Em area de destaque no topo e pontos do jogo",
            "Apenas no menu interno",
            "Nao precisa de logo"
          ],
          correctIndex: 2,
          explanation: "O portfolio reserva area clara para logo no topo e em blocos de destaque."
        },
        {
          id: "q3",
          title: "Qual efeito reforca a ideia de som e energia no catalogo?",
          options: [
            "Tela totalmente estatica",
            "Animacao de anel vibrando ao redor da marca",
            "Apenas texto corrido",
            "Fundo branco sem contraste",
            "Botoes invisiveis"
          ],
          correctIndex: 1,
          explanation: "O anel vibrando comunica energia visualmente."
        },
        {
          id: "q4",
          title: "No quiz, qual experiencia melhora o engajamento do cliente final?",
          options: [
            "Sem retorno visual",
            "Tempo infinito e sem desafios",
            "Feedback animado ao acertar e errar",
            "Apenas uma pergunta",
            "Bloquear todas as cores"
          ],
          correctIndex: 2,
          explanation: "Animacao de acerto ou erro deixa a experiencia mais real."
        },
        {
          id: "q5",
          title: "Qual objetivo do catalogo separado das telas internas?",
          options: [
            "Expor configuracoes administrativas ao cliente",
            "Servir como vitrine final da experiencia do cliente",
            "Substituir o painel admin",
            "Remover a identidade visual",
            "Reduzir opcoes de jogo"
          ],
          correctIndex: 1,
          explanation: "O catalogo separado apresenta o portfolio pronto para aprovacao."
        }
      ]
    },
    termo: {
      enabled: true,
      timeLimitSeconds: 120,
      wordLength: 5,
      maxAttempts: 6,
      words: ["ENERGIA", "VIBRA", "BRASIL", "TOTEM", "JOGO", "MARCA"]
    },
    forca: {
      enabled: true,
      timeLimitSeconds: 120,
      maxErrors: 6,
      words: ["ENERGIA", "VIBRA", "LABIRINTO", "QUIZ", "MEMORIA", "TOTEM"]
    }
  }
});
