import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  intent?: "neutral" | "primary" | "positive" | "warning";
};

const intentStyles: Record<NonNullable<Props["intent"]>, string> = {
  neutral: "bg-muted text-foreground/70 ring-border",
  primary: "bg-accent/10 text-accent ring-accent/20",
  positive: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  intent = "neutral",
}: Props) {
  return (
    <div className="group relative flex flex-col justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`grid h-8 w-8 place-items-center rounded-md ring-1 ${intentStyles[intent]}`}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <div className="font-mono text-[28px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {hint && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
