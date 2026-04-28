import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { useCurrency, applyCurrencyMask } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  /** Valor controlado em STRING já mascarada (ex.: "1.234,56") */
  value: string;
  onChange: (masked: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  inputMode?: "decimal" | "numeric";
  autoFocus?: boolean;
}

/**
 * Campo monetário com máscara automática conforme a moeda do usuário.
 * - Mostra o símbolo da moeda como prefixo.
 * - Aceita apenas dígitos; aplica máscara estilo "calculadora" (÷100).
 * - Funciona para BRL, USD, EUR, ARS, JPY etc.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder, id, className, inputMode = "decimal", autoFocus }, ref) => {
    const { option, code } = useCurrency();
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
          {option.symbol}
        </span>
        <Input
          ref={ref}
          id={id}
          inputMode={inputMode}
          autoFocus={autoFocus}
          placeholder={placeholder ?? "0,00"}
          value={value}
          onChange={(e) => onChange(applyCurrencyMask(e.target.value, code))}
          className={cn("h-12 rounded-xl pl-10 text-base", className)}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
