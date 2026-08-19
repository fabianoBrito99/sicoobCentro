import styles from "./FireworksAnimation.module.css";

export default function FireworksAnimation() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} className={styles.spark} style={{ ["--delay" as string]: `${index * 0.08}s` }} />
      ))}
    </div>
  );
}
