import type { PlayerRecord } from "@/types/game";
import { formatDateTime } from "@/utils/date";
import styles from "./TabelaParticipantes.module.css";

type Props = {
  participants: PlayerRecord[];
};

export default function TabelaParticipantes({ participants }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Jogo</th>
            <th>Acertos</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((item) => (
            <tr key={item.id}>
              <td>{item.fullName}</td>
              <td>{item.game === "memory" ? "Mem\u00F3ria" : "Ca\u00E7a-palavras"}</td>
              <td>{item.score}</td>
              <td>{item.wonPrize ? "Brinde" : "Sem brinde"}</td>
              <td>{formatDateTime(item.playedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
