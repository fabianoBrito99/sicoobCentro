export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
