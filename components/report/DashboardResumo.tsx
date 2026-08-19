import type { DashboardSummary } from "@/types/game";
import CardIndicador from "@/components/report/CardIndicador";
import styles from "./DashboardResumo.module.css";

type Props = {
  summary: DashboardSummary;
};

export default function DashboardResumo({ summary }: Props) {
  return (
    <section className={styles.grid}>
      <CardIndicador title="Total de pessoas" value={String(summary.totalPlayers)} />
      <CardIndicador title={"Jogaram mem\u00F3ria"} value={String(summary.memoryPlayers)} />
      <CardIndicador title={"Jogaram ca\u00E7a-palavras"} value={String(summary.wordSearchPlayers)} />
      <CardIndicador title="Mais brindes" value={summary.bestPrizeGame} />
      <CardIndicador title={"M\u00E9dia mem\u00F3ria"} value={String(summary.averageMemoryScore)} />
      <CardIndicador title={"M\u00E9dia ca\u00E7a-palavras"} value={String(summary.averageWordSearchScore)} />
      <CardIndicador title={"Vit\u00F3rias"} value={String(summary.wins)} />
      <CardIndicador title="Derrotas" value={String(summary.losses)} />
      <CardIndicador title={"Convers\u00E3o mem\u00F3ria"} value={`${summary.memoryConversionRate}%`} />
      <CardIndicador title={"Convers\u00E3o ca\u00E7a-palavras"} value={`${summary.wordSearchConversionRate}%`} />
    </section>
  );
}
