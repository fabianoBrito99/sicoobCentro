import type { DashboardSummary, PlayerRecord } from "@/types/game";

function average(items: number[]): number {
  if (!items.length) {
    return 0;
  }

  const total = items.reduce((sum, value) => sum + value, 0);
  return Number((total / items.length).toFixed(1));
}

function conversionRate(participants: PlayerRecord[]): number {
  if (!participants.length) {
    return 0;
  }

  const winners = participants.filter((item) => item.wonPrize).length;
  return Number(((winners / participants.length) * 100).toFixed(1));
}

export function buildDashboardSummary(participants: PlayerRecord[]): DashboardSummary {
  const memory = participants.filter((item) => item.game === "memory");
  const wordsearch = participants.filter((item) => item.game === "wordsearch");
  const memoryWinners = memory.filter((item) => item.wonPrize).length;
  const wordsearchWinners = wordsearch.filter((item) => item.wonPrize).length;

  return {
    totalPlayers: participants.length,
    memoryPlayers: memory.length,
    wordSearchPlayers: wordsearch.length,
    bestPrizeGame:
      memoryWinners === wordsearchWinners
        ? "Empate"
        : memoryWinners > wordsearchWinners
          ? "Jogo da Mem\u00F3ria"
          : "Ca\u00E7a-palavras",
    averageMemoryScore: average(memory.map((item) => item.score)),
    averageWordSearchScore: average(wordsearch.map((item) => item.score)),
    wins: participants.filter((item) => item.wonPrize).length,
    losses: participants.filter((item) => !item.wonPrize).length,
    memoryConversionRate: conversionRate(memory),
    wordSearchConversionRate: conversionRate(wordsearch)
  };
}

export function buildExcelXml(participants: PlayerRecord[]): string {
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const rows = participants
    .map(
      (item) => `
      <Row>
        <Cell><Data ss:Type="String">${escape(item.fullName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escape(item.cpf)}</Data></Cell>
        <Cell><Data ss:Type="String">${escape(item.phone)}</Data></Cell>
        <Cell><Data ss:Type="String">${escape(item.email)}</Data></Cell>
      </Row>`
    )
    .join("");

  return `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Participantes">
      <Table>
        <Row>
          <Cell><Data ss:Type="String">Nome completo</Data></Cell>
          <Cell><Data ss:Type="String">CPF</Data></Cell>
          <Cell><Data ss:Type="String">Telefone</Data></Cell>
          <Cell><Data ss:Type="String">E-mail</Data></Cell>
        </Row>
        ${rows}
      </Table>
    </Worksheet>
  </Workbook>`;
}

export function buildCsv(participants: PlayerRecord[]): string {
  const escape = (value: string): string => {
    const normalized = value.replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const header = ["Nome completo", "CPF", "Telefone", "E-mail"].join(",");
  const rows = participants.map((item) =>
    [escape(item.fullName), escape(item.cpf), escape(item.phone), escape(item.email)].join(",")
  );

  return [header, ...rows].join("\n");
}
