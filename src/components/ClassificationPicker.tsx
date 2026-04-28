import { Sparkles, ShoppingCart, Target as TargetIcon } from "lucide-react";
import { Classification } from "@/types";
import { cn } from "@/lib/utils";
import { InfoHint } from "./InfoHint";

interface Props {
  value?: Classification;
  onChange: (v: Classification) => void;
  /** compacto: mostra só ícones (para listas) */
  compact?: boolean;
}

const OPTIONS: { value: Classification; label: string; icon: typeof Sparkles; color: string; tip: string }[] = [
  {
    value: "essencial",
    label: "Essencial",
    icon: Sparkles,
    color: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
    tip: "Gastos que mantêm sua vida funcionando: moradia, comida, saúde, transporte para trabalhar. Se some, sua rotina trava.",
  },
  {
    value: "superfluo",
    label: "Supérfluo",
    icon: ShoppingCart,
    color: "text-amber-600 border-amber-500/40 bg-amber-500/10",
    tip: "Prazeres e conveniências: streaming, restaurantes, roupas extras, hobbies. Não é proibido — é o primeiro lugar para cortar quando aperta.",
  },
  {
    value: "meta",
    label: "Meta",
    icon: TargetIcon,
    color: "text-primary border-primary/40 bg-primary/10",
    tip: "Dinheiro destinado aos seus sonhos e objetivos: reserva, viagem, curso, investimento. É o que te aproxima do futuro que você quer.",
  },
];

/**
 * Seletor compacto E/S/M usado em todo lançamento. Educa o usuário a
 * classificar cada gasto/entrada (metodologia Cerbasi) ocupando pouco espaço.
 */
export function ClassificationPicker({ value, onChange, compact }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-1 gap-1.5 rounded-xl bg-secondary/60 p-1">
        {OPTIONS.map((o) => {
          const active = value === o.value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-smooth",
                active ? o.color : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={active}
              aria-label={o.label}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
              {!compact && <span>{o.label}</span>}
            </button>
          );
        })}
      </div>
      {!compact && (
        <InfoHint
          title="Por que classificar?"
          description="Toda escolha financeira cabe em 3 caixas: Essencial (mantém você de pé), Supérfluo (te dá prazer hoje), Meta (te leva ao futuro). Classificar revela onde seu dinheiro realmente vai — e o que cortar primeiro."
          example="Cerbasi: 'O orçamento não é prisão, é mapa'. Sem classificação, você só anota; com ela, você decide."
        />
      )}
    </div>
  );
}

export const CLASSIFICATION_META = OPTIONS;
