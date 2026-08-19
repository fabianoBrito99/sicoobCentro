export type QuizQuestion = {
  id: string;
  title: string;
  options: string[];
  correctIndex: number;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    title: "O que diferencia uma cooperativa financeira de um banco tradicional?",
    options: [
      "Os clientes tambem sao associados e participam dos resultados",
      "Ela nao oferece produtos financeiros",
      "Ela atende somente empresas grandes",
      "Ela nao possui atendimento digital"
    ],
    correctIndex: 0
  },
  {
    id: "q2",
    title: "Qual atitude ajuda a manter uma vida financeira mais organizada?",
    options: [
      "Anotar ganhos, gastos e planejar compras",
      "Comprar sempre por impulso",
      "Usar todo o limite disponivel",
      "Ignorar pequenas despesas"
    ],
    correctIndex: 0
  },
  {
    id: "q3",
    title: "No cooperativismo, qual valor e mais importante?",
    options: ["Individualismo", "Competicao interna", "Colaboracao", "Improviso"],
    correctIndex: 2
  },
  {
    id: "q4",
    title: "Para que serve uma reserva financeira?",
    options: [
      "Para lidar melhor com imprevistos",
      "Para gastar mais no cartao",
      "Para substituir o planejamento",
      "Para evitar qualquer investimento"
    ],
    correctIndex: 0
  },
  {
    id: "q5",
    title: "Qual e uma pratica segura ao usar canais digitais?",
    options: [
      "Compartilhar senha com conhecidos",
      "Conferir links e nunca informar senhas fora dos canais oficiais",
      "Salvar senha em qualquer computador publico",
      "Responder mensagens pedindo codigo de seguranca"
    ],
    correctIndex: 1
  }
];
