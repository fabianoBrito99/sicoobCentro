import styles from "./CardIndicador.module.css";

type Props = {
  title: string;
  value: string;
};

export default function CardIndicador({ title, value }: Props) {
  return (
    <article className={styles.card}>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}
