import { useStorage } from "./useStorage";

export interface CurrencyOption {
  code: string;        // ISO 4217
  label: string;       // exibido no seletor
  locale: string;      // BCP-47 para Intl
  symbol: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "BRL", label: "Real brasileiro", locale: "pt-BR", symbol: "R$", flag: "🇧🇷" },
  { code: "USD", label: "US Dollar",       locale: "en-US", symbol: "$",  flag: "🇺🇸" },
  { code: "EUR", label: "Euro",            locale: "de-DE", symbol: "€",  flag: "🇪🇺" },
  { code: "GBP", label: "British Pound",   locale: "en-GB", symbol: "£",  flag: "🇬🇧" },
  { code: "ARS", label: "Peso argentino",  locale: "es-AR", symbol: "$",  flag: "🇦🇷" },
  { code: "MXN", label: "Peso mexicano",   locale: "es-MX", symbol: "$",  flag: "🇲🇽" },
  { code: "CLP", label: "Peso chileno",    locale: "es-CL", symbol: "$",  flag: "🇨🇱" },
  { code: "COP", label: "Peso colombiano", locale: "es-CO", symbol: "$",  flag: "🇨🇴" },
  { code: "JPY", label: "Yen japonês",     locale: "ja-JP", symbol: "¥",  flag: "🇯🇵" },
  { code: "CNY", label: "Yuan chinês",     locale: "zh-CN", symbol: "¥",  flag: "🇨🇳" },
  { code: "AOA", label: "Kwanza angolano", locale: "pt-AO", symbol: "Kz", flag: "🇦🇴" },
  { code: "MZN", label: "Metical",         locale: "pt-MZ", symbol: "MT", flag: "🇲🇿" },
  { code: "CAD", label: "Dólar canadense", locale: "en-CA", symbol: "$",  flag: "🇨🇦" },
  { code: "AUD", label: "Dólar australiano", locale: "en-AU", symbol: "$", flag: "🇦🇺" },
  { code: "CHF", label: "Franco suíço",    locale: "de-CH", symbol: "Fr", flag: "🇨🇭" },
];

const DEFAULT_CODE = "BRL";

export function getCurrencyOption(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Hook global de moeda — sempre escopado por usuário (via useStorage). */
export function useCurrency() {
  const [code, setCode] = useStorage<string>("d21.currency", DEFAULT_CODE);
  const opt = getCurrencyOption(code);

  const format = (value: number) =>
    value.toLocaleString(opt.locale, { style: "currency", currency: opt.code });

  return { code, setCode, option: opt, format };
}

/** Formata um valor numérico em string usando os separadores do locale. */
export function formatNumberInput(value: number, code: string): string {
  const opt = getCurrencyOption(code);
  return value.toLocaleString(opt.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte uma string digitada (qualquer formato) em número.
 * Estratégia: extrai apenas dígitos, divide por 100 → comportamento
 * tipo "máscara de calculadora" (consistente entre todos os locales).
 */
export function parseMaskedToNumber(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

/** Aplica máscara monetária ao valor digitado, respeitando o locale. */
export function applyCurrencyMask(input: string, code: string): string {
  const n = parseMaskedToNumber(input);
  if (n === 0 && input.replace(/\D/g, "") === "") return "";
  return formatNumberInput(n, code);
}
