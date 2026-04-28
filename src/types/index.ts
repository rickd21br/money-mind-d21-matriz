export type TransactionType = "income" | "expense";

/** Classificação ESM — pilar central da metodologia (Cerbasi). */
export type Classification = "essencial" | "superfluo" | "meta";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  group?: string;
  category: string;
  description: string;
  date: string; // ISO
  createdAt: string;
  /** Essencial / Supérfluo / Meta */
  classification?: Classification;
}

export interface Goal {
  id: string;
  title: string;
  /** Valor alvo em R$ */
  target: number;
  /** Valor já guardado/aportado */
  saved: number;
  /** Data limite ISO (yyyy-mm-dd), opcional */
  deadline?: string;
  /** Sonho/projeto descrito pelo usuário — usado nos alertas emocionais */
  dream?: string;
  createdAt: string;
}

export interface JourneyDay {
  day: number;
  title: string;
  mission: string;
  description: string;
}

export interface User {
  name: string;
  email: string;
}

// Legacy flat list (kept for backward compatibility)
export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Investimentos",
  "Outros",
] as const;

// Catálogo hierárquico: tipo → grupo → categorias
export const CATEGORY_CATALOG: Record<TransactionType, Record<string, string[]>> = {
  expense: {
    "Casa": ["Aluguel", "Condomínio", "Energia", "Água", "Internet", "Gás", "Manutenção", "Mercado"],
    "Pessoal": ["Saúde", "Educação", "Vestuário", "Higiene", "Transporte", "Alimentação"],
    "Estilo de vida": ["Lazer", "Restaurantes", "Viagens", "Assinaturas", "Hobbies", "Presentes"],
    "Negócios": ["Marketing", "Ferramentas", "Impostos", "Serviços", "Equipamentos"],
    "Investimentos": ["Renda fixa", "Renda variável", "Cripto", "Previdência", "Aportes"],
    "Extras": ["Imprevistos", "Doações", "Taxas", "Outros"],
  },
  income: {
    "Salário": ["Salário CLT", "Pró-labore", "13º", "Férias", "Bônus"],
    "Renda extra": ["Freelance", "Comissão", "Vendas", "Aluguéis"],
    "Investimentos": ["Dividendos", "Juros", "Resgate", "Lucros"],
    "Outros": ["Presente", "Reembolso", "Outros"],
  },
};

