import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, useCurrency } from "@/hooks/useCurrency";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Variante visual: claro (sobre fundo escuro) ou padrão. */
  variant?: "light" | "default";
  className?: string;
}

export function CurrencySelect({ variant = "default", className }: Props) {
  const { code, setCode, option } = useCurrency();

  return (
    <Select value={code} onValueChange={setCode}>
      <SelectTrigger
        aria-label="Moeda"
        className={cn(
          "h-11 rounded-xl",
          variant === "light" && "border-white/20 bg-white/95 text-foreground",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue>
            <span className="font-medium">
              {option.flag} {option.code} <span className="text-muted-foreground">· {option.symbol}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            <span className="text-sm">
              {c.flag} <span className="font-semibold">{c.code}</span> — {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
