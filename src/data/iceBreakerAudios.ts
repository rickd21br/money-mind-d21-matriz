/**
 * Áudios "Quebra-Gelo" — Ponto de partida do app.
 * Narrativa do Mentor do Progresso, recebendo o usuário no primeiro acesso.
 *
 * Os títulos seguem a curadoria do criador (Franciel) — cada bloco é um
 * passo emocional/cognitivo da entrada na Jornada do Progresso.
 */

export interface IceBreakerAudio {
  id: string;
  number: number;
  /** Título curto exibido no card. */
  title: string;
  /** Subtítulo de apoio — narrativa coerente com a mensagem do bloco. */
  subtitle: string;
  /** Duração aproximada (mm:ss). */
  duration: string;
  /** URL pública do áudio .wav. */
  src: string;
}

const BASE = "https://jornadadoprogresso.com/wp-content/uploads/2026/04";
const audio = (n: number) => `${BASE}/int-aud${n}.wav`;

export const ICE_BREAKER_AUDIOS: IceBreakerAudio[] = [
  {
    id: "ib-1",
    number: 1,
    title: "Comece aqui",
    subtitle: "O Mentor do Progresso te recebe — bem-vindo ao D21.",
    duration: "00:45",
    src: audio(1),
  },
  {
    id: "ib-2",
    number: 2,
    title: "Caindo na real",
    subtitle: "Reconheça o que precisa mudar — sem fugir, sem culpa.",
    duration: "00:40",
    src: audio(2),
  },
  {
    id: "ib-3",
    number: 3,
    title: "Nosso posicionamento",
    subtitle: "Aqui não tem julgamento. Aqui tem reconstrução.",
    duration: "00:50",
    src: audio(3),
  },
  {
    id: "ib-4",
    number: 4,
    title: "A transformação começa",
    subtitle: "Você passa a enxergar o dinheiro de outra forma.",
    duration: "00:35",
    src: audio(4),
  },
  {
    id: "ib-5",
    number: 5,
    title: "Quebre a expectativa",
    subtitle: "Esqueça motivação. Aqui é compromisso e repetição.",
    duration: "00:30",
    src: audio(5),
  },
  {
    id: "ib-6",
    number: 6,
    title: "Hackeando o eu gastador",
    subtitle: "Apareça todos os dias — principalmente quando ninguém vê.",
    duration: "00:50",
    src: audio(6),
  },
  {
    id: "ib-7",
    number: 7,
    title: "Pra que isso aqui?",
    subtitle: "Seu ponto de retorno quando a mente tentar te sabotar.",
    duration: "00:40",
    src: audio(7),
  },
  {
    id: "ib-8",
    number: 8,
    title: "Blindagem pessoal",
    subtitle: "Um sistema, um guia, um processo — sua nova vantagem.",
    duration: "00:55",
    src: audio(8),
  },
  {
    id: "ib-9",
    number: 9,
    title: "Reprogramação mental",
    subtitle: "Não precisa de perfeição. Precisa de constância.",
    duration: "00:40",
    src: audio(9),
  },
  {
    id: "ib-10",
    number: 10,
    title: "Impacto final",
    subtitle: "Você deixa de reagir — e começa a construir.",
    duration: "00:55",
    src: audio(10),
  },
];
