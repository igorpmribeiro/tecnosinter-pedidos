import { CheckCircle2, Clock, XCircle } from "lucide-react";

type OrderStatus = "AGUARDANDO" | "APROVADO" | "REPROVADO";

const config: Record<
  OrderStatus,
  { label: string; className: string; Icon: typeof Clock; dot: string }
> = {
  AGUARDANDO: {
    label: "Aguardando",
    className: "bg-amber-50 text-amber-900 ring-amber-200",
    dot: "bg-amber-500",
    Icon: Clock,
  },
  APROVADO: {
    label: "Aprovado",
    className: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  REPROVADO: {
    label: "Reprovado",
    className: "bg-red-50 text-red-900 ring-red-200",
    dot: "bg-red-500",
    Icon: XCircle,
  },
};

export function OrderStatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatus;
  size?: "sm" | "md";
}) {
  const { label, className, Icon } = config[status];
  const sizeCls =
    size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[11px]";
  const iconSize = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ${className} ${sizeCls}`}
    >
      <Icon className={iconSize} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function OrderStatusDot({ status }: { status: OrderStatus }) {
  const { dot, label } = config[status];
  return (
    <span className="inline-flex items-center gap-2 text-xs text-foreground/80">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
