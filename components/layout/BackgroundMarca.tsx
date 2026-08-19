import styles from "./BackgroundMarca.module.css";
import MarqueeBand from "@/components/common/MarqueeBand";

export default function BackgroundMarca() {
  return (
    <div className={styles.shell} aria-hidden="true">
      <MarqueeBand position="top" />
      <MarqueeBand position="bottom" />
      <div className={styles.gradient} />
      <div className={styles.orb} />
      <div className={styles.orbSecondary} />
      <div className={styles.ribbonOne} />
      <div className={styles.ribbonTwo} />
      <div className={styles.circleOne} />
      <div className={styles.circleTwo} />
      <div className={styles.grid} />
      <div className={styles.noise} />
    </div>
  );
}
