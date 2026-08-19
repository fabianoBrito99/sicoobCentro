import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sicoob Centro Games",
    short_name: "Sicoob Centro",
    description: "PWA de campanha com jogos para eventos e totem",
    start_url: "/",
    display: "standalone",
    background_color: "#006b72",
    theme_color: "#00a99d",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
