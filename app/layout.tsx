import type { Metadata } from "next";
import OfflineAssetsBootstrap from "@/components/common/OfflineAssetsBootstrap";
import PendingSyncBootstrap from "@/components/common/PendingSyncBootstrap";
import PwaRefreshGuard from "@/components/common/PwaRefreshGuard";
import PwaVersionBootstrap from "@/components/common/PwaVersionBootstrap";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Sicoob Centro | Totem de Jogos",
  description: "Totem de jogos do Sicoob Centro"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <PwaVersionBootstrap />
        <PwaRefreshGuard />
        <OfflineAssetsBootstrap />
        <PendingSyncBootstrap />
        {children}
      </body>
    </html>
  );
}
