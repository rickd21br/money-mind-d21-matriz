import { Lightbulb } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoHintProps {
  title: string;
  description: string;
  /** Texto extra opcional, ex.: "Exemplo prático: ..." */
  example?: string;
  className?: string;
  /** Tamanho do ícone */
  size?: "sm" | "md";
}

/**
 * Botão circular "?" que abre um popover didático com a definição
 * de um grupo, categoria ou conceito financeiro. Pensado para educar
 * o usuário sem tirar o foco do fluxo principal.
 */
export function InfoHint({
  title,
  description,
  example,
  className,
  size = "sm",
}: InfoHintProps) {
  const sizeCls = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`O que é ${title}?`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            className
          )}
        >
          <Lightbulb className={sizeCls} strokeWidth={2.2} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-64 rounded-2xl border border-primary/20 bg-popover/80 p-3.5 shadow-floating backdrop-blur-md supports-[backdrop-filter]:bg-popover/70"
      >
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight text-foreground">
              {title}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
            {example && (
              <p className="mt-2 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] italic leading-snug text-foreground/80">
                💡 {example}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
