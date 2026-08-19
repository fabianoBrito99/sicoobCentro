export type GameType = "memory" | "wordsearch";

export type DailyGameSelection = {
  date: string;
  game: GameType;
};

export type PlayerFormData = {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  consentAccepted: boolean;
};

export type PlayerRecord = PlayerFormData & {
  id: string;
  game: GameType;
  score: number;
  wonPrize: boolean;
  playedAt: string;
  consentAcceptedAt: string;
};

export type DashboardSummary = {
  totalPlayers: number;
  memoryPlayers: number;
  wordSearchPlayers: number;
  bestPrizeGame: string;
  averageMemoryScore: number;
  averageWordSearchScore: number;
  wins: number;
  losses: number;
  memoryConversionRate: number;
  wordSearchConversionRate: number;
};

export type AppStorage = {
  dailyGame: DailyGameSelection | null;
  participants: PlayerRecord[];
  lastWordSetKey: string | null;
};
