import styles from "./Cronometro.module.css";

type Props = {
  secondsLeft: number;
};

export default function Cronometro({ secondsLeft }: Props) {
  const state =
    secondsLeft <= 10 ? styles.danger : secondsLeft <= 30 ? styles.warning : styles.safe;

  return (
    <div className={`${styles.timer} ${state}`}>
      <span className={styles.label}>Tempo restante</span>
      <strong>{secondsLeft}s</strong>
    </div>
  );
}
