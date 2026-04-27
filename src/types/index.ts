export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  group?: string;
  category: string;
  description: string;
  date: string; // ISO
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
