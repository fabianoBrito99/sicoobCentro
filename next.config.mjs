import fs from "node:fs";
import path from "node:path";
import withPWAInit from "next-pwa";
import runtimeCaching from "./pwa-runtime-caching.mjs";

const appShellRevision = process.env.VERCEL_GIT_COMMIT_SHA ?? "local-shell-v1";
const routesConfigPath = path.join(process.cwd(), "config", "pwa-routes.json");
const offlineRoutes = JSON.parse(fs.readFileSync(routesConfigPath, "utf8"));

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  dynamicStartUrl: false,
  fallbacks: {
    document: "/_offline",
    image: "/icons/icon-192.svg"
  },
  runtimeCaching,
  additionalManifestEntries: offlineRoutes.map((route) => ({
    url: route,
    revision: appShellRevision
  }))
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appShellRevision
  },
  reactStrictMode: true,
  turbopack: {}
};

export default withPWA(nextConfig);
