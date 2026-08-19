import { shuffle } from "@/lib/utils/shuffle";

export type MemoryCardItem = {
  id: string;
  image: string;
  pairKey: string;
};

export function buildMemoryDeck(): MemoryCardItem[] {
  // Usa as 10 imagens padronizadas em /public/imX.png e embaralha as posicoes a cada partida.
  const images = Array.from({ length: 10 }, (_, index) => `/im${index + 1}.png`);
  const pairs = images.flatMap((image, index) => [
    { id: `a-${index}`, image, pairKey: `pair-${index}` },
    { id: `b-${index}`, image, pairKey: `pair-${index}` }
  ]);
  return shuffle(pairs);
}
