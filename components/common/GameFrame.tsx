import type { PropsWithChildren } from "react";
import BackgroundMarca from "@/components/layout/BackgroundMarca";
import LogoHeader from "@/components/common/LogoHeader";
import Cronometro from "@/components/common/Cronometro";
import styles from "./GameFrame.module.css";

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  secondsLeft: number;
  score: number;
}>;

export default function GameFrame({ title, subtitle, secondsLeft, score, children }: Props) {
  return (
    <main className={styles.page}>
      <BackgroundMarca />
      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.copy}>
            <div>
              <p className={styles.eyebrow}>Jogo do dia</p>
              <h1>{title}</h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </div>
          <div className={styles.side}>
            <Cronometro secondsLeft={secondsLeft} />
            <div className={styles.score}>
              <span>Acertos</span>
              <strong>{score}</strong>
            </div>
          </div>
        </header>
        {children}
        <footer className={styles.footer}>
          <LogoHeader compact />
        </footer>
      </section>
    </main>
  );
}
