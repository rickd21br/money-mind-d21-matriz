export interface InspirationAudio {
  id: string;
  title: string;
  author: string;
  description: string;
  hook: string;
  duration: string;
  format: "MP3" | "WAV" | "MP3/WAV";
  src: string;
  folderLabel: string;
  tracks: InspirationTrack[];
  icon: "mind" | "wealth" | "habit" | "couple";
}

export interface InspirationTrack {
  id: string;
  title: string;
  duration: string;
  src: string;
}

const MEDIA_BASE = "https://jornadadoprogresso.com/wp-content/uploads/2026/04";
const media = (file: string) => `${MEDIA_BASE}/${file}`;

export const INSPIRATION_LIBRARY: InspirationAudio[] = [
  {
    id: "bonus-pai-rico-pai-pobre",
    title: "Pai Rico, Pai Pobre",
    author: "Robert Kiyosaki",
    description: "Aprenda a diferenciar ativos, passivos e decisões que constroem liberdade.",
    hook: "Um convite direto para rever a forma como você trabalha, gasta e constrói patrimônio.",
    duration: "Coleção",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Pasta com 3 faixas",
    tracks: [
      { id: "prpp-1", title: "Faixa 01 · Mentalidade de ativos", duration: "A liberar", src: media("pai-rico-pai-pobre-01.mp3") },
      { id: "prpp-2", title: "Faixa 02 · Fluxo de caixa pessoal", duration: "A liberar", src: media("pai-rico-pai-pobre-02.mp3") },
      { id: "prpp-3", title: "Faixa 03 · Decisões de patrimônio", duration: "A liberar", src: media("pai-rico-pai-pobre-03.mp3") },
    ],
    icon: "wealth",
  },
  {
    id: "bonus-homem-mais-rico-babilonia",
    title: "O Homem Mais Rico da Babilônia",
    author: "George S. Clason",
    description: "Princípios simples para guardar, multiplicar e proteger o dinheiro.",
    hook: "Lições atemporais para transformar disciplina em segurança e clareza financeira.",
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Audiobook em 2 faixas",
    tracks: [
      { id: "babilonia-1", title: "Faixa 01 · Guarde uma parte", duration: "A liberar", src: media("homem-mais-rico-babilonia-01.mp3") },
      { id: "babilonia-2", title: "Faixa 02 · Multiplique com disciplina", duration: "A liberar", src: media("homem-mais-rico-babilonia-02.mp3") },
    ],
    icon: "wealth",
  },
  {
    id: "bonus-segredos-mente-milionaria",
    title: "Os Segredos da Mente Milionária",
    author: "T. Harv Eker",
    description: "Uma imersão para reconhecer crenças e fortalecer uma mentalidade próspera.",
    hook: "Perfeito para identificar padrões invisíveis que limitam escolhas e resultados.",
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Audiobook",
    tracks: [
      { id: "mente-milionaria-1", title: "Faixa única · Arquivos de riqueza", duration: "A liberar", src: media("segredos-mente-milionaria.mp3") },
    ],
    icon: "mind",
  },
  {
    id: "bonus-habitos-atomicos",
    title: "Hábitos Atômicos",
    author: "James Clear",
    description: "Pequenos sistemas para criar constância e evoluir um pouco todos os dias.",
    hook: "Ideal para quem quer sair da motivação passageira e criar progresso real.",
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Audiobook em 2 faixas",
    tracks: [
      { id: "habitos-1", title: "Faixa 01 · Sistemas antes de metas", duration: "A liberar", src: media("habitos-atomicos-01.mp3") },
      { id: "habitos-2", title: "Faixa 02 · Pequenas melhorias diárias", duration: "A liberar", src: media("habitos-atomicos-02.mp3") },
    ],
    icon: "habit",
  },
  {
    id: "bonus-psicologia-financeira",
    title: "A Psicologia Financeira",
    author: "Morgan Housel",
    description: "Reflexões claras sobre comportamento, escolhas e maturidade com dinheiro.",
    hook: "Uma escuta essencial para entender por que razão nem sempre vence a matemática.",
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Audiobook",
    tracks: [
      { id: "psicologia-1", title: "Faixa única · Comportamento e dinheiro", duration: "A liberar", src: media("psicologia-financeira.mp3") },
    ],
    icon: "mind",
  },
  {
    id: "bonus-casais-inteligentes",
    title: "Casais Inteligentes Enriquecem Juntos",
    author: "Gustavo Cerbasi",
    description: "Organização financeira para transformar planos em decisões compartilhadas.",
    hook: "Para alinhar sonhos, conversas difíceis e decisões práticas dentro da relação.",
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    folderLabel: "Audiobook",
    tracks: [
      { id: "casais-1", title: "Faixa única · Planos e conversas", duration: "A liberar", src: media("casais-inteligentes-enriquecem-juntos.mp3") },
    ],
    icon: "couple",
  },
];