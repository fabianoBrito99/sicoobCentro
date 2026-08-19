import styles from "./WordList.module.css";

type Props = {
  words: string[];
  foundWords: string[];
};

export default function WordList({ words, foundWords }: Props) {
  return (
    <div className={styles.list}>
      {words.map((word) => (
        <span key={word} className={`${styles.tag} ${foundWords.includes(word) ? styles.found : ""}`}>
          {word}
        </span>
      ))}
    </div>
  );
}
