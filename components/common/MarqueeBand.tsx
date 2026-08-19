import styles from "./MarqueeBand.module.css";

type Props = {
  position: "top" | "bottom";
};

const message = "COOPERAR É COISA NOSSA!   *   VEM PRA COOP!   *   ";

export default function MarqueeBand({ position }: Props) {
  return (
    <div className={`${styles.band} ${styles[position]}`} aria-hidden="true">
      <div className={styles.track}>
        <span>{message}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
