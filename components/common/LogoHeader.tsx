import { useOfflineAssetSrc } from "@/lib/hooks/useOfflineAssetSrc";
import styles from "./LogoHeader.module.css";

type Props = {
  compact?: boolean;
};

export default function LogoHeader({ compact = false }: Props) {
  const logoSrc = useOfflineAssetSrc("/logo.png");

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ""}`}>
      <img src={logoSrc} alt="Sicoob Centro" className={styles.mark} />
      <div className={styles.copy}></div>
    </div>
  );
}
