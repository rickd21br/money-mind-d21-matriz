export interface InspirationAudio {
  id: string;
  title: string;
  author: string;
  description: string;
  hook: string;
  duration: string;
  format: "MP3" | "WAV" | "MP3/WAV";
  src: string;
  icon: "mind" | "wealth" | "habit" | "couple";
}

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
    icon: "couple",
  },
];