export interface InspirationAudio {
  id: string;
  title: string;
  author: string;
  description: string;
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
    duration: "Audiobook",
    format: "MP3/WAV",
    src: "",
    icon: "couple",
  },
];