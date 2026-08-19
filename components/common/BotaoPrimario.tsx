import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import styles from "./BotaoPrimario.module.css";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  block?: boolean;
};

export default function BotaoPrimario({ children, className = "", block, ...props }: Props) {
  return (
    <button
      className={`${styles.button} ${block ? styles.block : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
