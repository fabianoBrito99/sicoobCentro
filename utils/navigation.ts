"use client";

export function navigateToPath(path: string): void {
  window.location.assign(path);
}

export function replacePath(path: string): void {
  window.location.replace(path);
}
