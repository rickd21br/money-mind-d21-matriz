export interface AudioChapter {
  id: string;
  number: number;
  title: string;
  author: string;
  duration: string; // mm:ss aprox.
  /** URL pública do áudio (vazio enquanto não publicado). */
  src: string;
  insights: string[];
  challenges: string[];
  triggers: string;
}

const MEDIA_BASE = "https://jornadadoprogresso.com/wp-content/uploads/2026/04";
const media = (n: number) => `${MEDIA_BASE}/int-aud${n}.wav`;

/**
 * Capítulos do Ebook "Desafio Jornada do Progresso".
 * Cada capítulo já fica conectado ao player do app quando houver URL pública.
 */
export const AUDIO_CHAPTERS: AudioChapter[] = [
  {
    id: "cap-1",
    number: 1,
    title: "Boas-vindas à Jornada",
    author: "Franciel Sousa",
    duration: "06:00",
    src: media(1),
    insights: [
      "Toda transformação começa com uma decisão consciente.",
      "Você não está sozinho: a jornada é feita junto aos mestres.",
    ],
    challenges: [
      "Escreva por que você decidiu começar essa jornada.",
      "Defina o resultado que quer alcançar em 21 dias.",
    ],
    triggers: "O primeiro passo já te separa de quem você era ontem.",
  },
  {
    id: "cap-2",
    number: 2,
    title: "Casais Inteligentes & Orçamento Familiar",
    author: "Gustavo Cerbasi",
    duration: "08:00",
    src: media(2),
    insights: [
      "Sem clareza não há controle: medir é o primeiro passo.",
      "Orçamento em casal alinha sonhos e elimina conflitos.",
    ],
    challenges: [
      "Liste 100% dos seus gastos do último mês.",
      "Classifique cada um como Essencial, Supérfluo ou Meta.",
    ],
    triggers: "Você não pode mudar aquilo que não enxerga. Hoje você abre os olhos.",
  },
  {
    id: "cap-3",
    number: 3,
    title: "Gastar Menos, Ganhar Mais, Investir Melhor",
    author: "Tiago Nigro (Primo Rico)",
    duration: "09:00",
    src: media(3),
    insights: [
      "Renda ativa te sustenta. Renda passiva te liberta.",
      "Investir 20–30% da renda muda sua trajetória em 5 anos.",
    ],
    challenges: ["Mapeie suas fontes de renda atuais.", "Defina seu % de aporte mensal."],
    triggers: "Faça o dinheiro trabalhar por você — não o contrário.",
  },
  {
    id: "cap-4",
    number: 4,
    title: "Bola de Neve das Dívidas",
    author: "Dave Ramsey",
    duration: "07:30",
    src: media(4),
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
    id: "cap-5",
    number: 5,
    title: "Pai Rico, Pai Pobre — Ativos vs Passivos",
    author: "Robert Kiyosaki",
    duration: "10:00",
    src: media(5),
    insights: [
      "Ativo coloca dinheiro no bolso. Passivo tira.",
      "Os ricos compram ativos; os pobres acumulam passivos disfarçados.",
    ],
    challenges: [
      "Identifique 1 passivo que você acreditava ser ativo.",
      "Defina o próximo ativo que você quer adquirir.",
    ],
    triggers: "Não trabalhe por dinheiro. Aprenda a fazê-lo trabalhar para você.",
  },
  {
    id: "cap-6",
    number: 6,
    title: "Pague-se Primeiro & Hábitos de Riqueza",
    author: "George S. Clason",
    duration: "08:30",
    src: media(6),
    insights: [
      "Guarde no mínimo 10% de tudo que você ganha — antes de qualquer gasto.",
      "Hábitos consistentes superam grandes ganhos esporádicos.",
    ],
    challenges: [
      "Automatize hoje a transferência de 10% para sua reserva.",
      "Liste 3 hábitos financeiros que vai manter por 21 dias.",
    ],
    triggers: "Uma parte do que você ganha é sua para guardar.",
  },
  {
    id: "cap-7",
    number: 7,
    title: "Hábitos Atômicos da Prosperidade",
    author: "James Clear",
    duration: "08:00",
    src: media(7),
    insights: [
      "1% melhor por dia = 37x melhor em um ano.",
      "Você não sobe ao nível das suas metas; cai ao nível dos seus sistemas.",
    ],
    challenges: [
      "Defina 1 micro-hábito financeiro de 2 minutos.",
      "Empilhe-o a uma rotina que você já faz.",
    ],
    triggers: "Pequenos hábitos. Grandes resultados. Sempre.",
  },
  {
    id: "cap-8",
    number: 8,
    title: "Os Segredos da Mente Milionária",
    author: "T. Harv Eker",
    duration: "09:00",
    src: media(8),
    insights: [
      "Sua conta bancária reflete o seu modelo mental de dinheiro.",
      "Pensamento gera sentimento, sentimento gera ação, ação gera resultado.",
    ],
    challenges: [
      "Identifique 1 crença limitante sobre dinheiro.",
      "Reescreva-a em uma declaração de prosperidade.",
    ],
    triggers: "Mude a raiz e os frutos mudarão sozinhos.",
  },
  {
    id: "cap-9",
    number: 9,
    title: "Investindo com Sabedoria — O Jogo Longo",
    author: "Warren Buffett",
    duration: "09:30",
    src: media(9),
    insights: [
      "Tempo no mercado vence tentar acertar o mercado.",
      "Compre empresas que você entenderia segurar por 10 anos.",
    ],
    challenges: [
      "Estude 1 ativo de longo prazo nesta semana.",
      "Defina seu primeiro aporte recorrente.",
    ],
    triggers: "O melhor momento para plantar foi há 20 anos. O segundo melhor é hoje.",
  },
];
