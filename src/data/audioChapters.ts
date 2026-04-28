export interface AudioChapter {
  id: string;
  number: number;
  title: string;
  author: string;
  duration: string; // mm:ss aprox.
  /** URL pública do MP3. Coloque a sua aqui (ou deixe vazio para placeholder). */
  src: string;
  insights: string[];
  challenges: string[];
  triggers: string;
}

/** Áudio de teste (CC0). Substitua pela URL do seu domínio quando publicar. */
const SAMPLE = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3";

export const AUDIO_CHAPTERS: AudioChapter[] = [
  {
    id: "cap-1",
    number: 1,
    title: "Diagnóstico Financeiro",
    author: "Gustavo Cerbasi",
    duration: "08:00",
    src: SAMPLE,
    insights: [
      "Sem clareza não há controle: medir é o primeiro passo.",
      "Cada gasto revela uma prioridade — escutada ou ignorada.",
    ],
    challenges: [
      "Liste 100% dos seus gastos do último mês.",
      "Classifique cada um como Essencial, Supérfluo ou Meta.",
    ],
    triggers: "Você não pode mudar aquilo que não enxerga. Hoje você abre os olhos.",
  },
  {
    id: "cap-2",
    number: 2,
    title: "Bola de Neve das Dívidas",
    author: "Dave Ramsey",
    duration: "07:30",
    src: SAMPLE,
    insights: [
      "Pequenas vitórias geram grande tração emocional.",
      "Quitar a menor dívida primeiro destrava a próxima.",
    ],
    challenges: [
      "Liste todas as dívidas em ordem crescente.",
      "Defina um valor extra mensal para o ataque.",
    ],
    triggers: "A liberdade começa quando você decide quem manda no seu dinheiro.",
  },
  {
    id: "cap-3",
    number: 3,
    title: "Mentalidade de Investidor",
    author: "Tiago Nigro (Primo Rico)",
    duration: "09:15",
    src: SAMPLE,
    insights: [
      "Renda ativa te sustenta. Renda passiva te liberta.",
      "Investir 20–30% da renda muda sua trajetória em 5 anos.",
    ],
    challenges: [
      "Mapeie suas fontes de renda atuais.",
      "Defina seu % de aporte mensal.",
    ],
    triggers: "Faça o dinheiro trabalhar por você — não o contrário.",
  },
  {
    id: "cap-4",
    number: 4,
    title: "Pai Rico, Pai Pobre",
    author: "Robert Kiyosaki",
    duration: "10:00",
    src: SAMPLE,
    insights: [
      "Ativo coloca dinheiro no bolso. Passivo tira.",
      "Os ricos compram ativos. Os pobres acumulam passivos disfarçados de ativos.",
    ],
    challenges: [
      "Identifique 1 passivo que você acreditava ser ativo.",
      "Defina o próximo ativo que você quer adquirir.",
    ],
    triggers: "Não trabalhe por dinheiro. Aprenda a fazê-lo trabalhar para você.",
  },
];
