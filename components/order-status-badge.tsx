import { CheckCircle2, Clock, XCircle } from "lucide-react";

type OrderStatus = "AGUARDANDO" | "APROVADO" | "REPROVADO";

const config: Record<
  OrderStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  AGUARDANDO: {
    label: "Aguardando",
    className: "bg-amber-100 text-amber-900 ring-amber-200",
    Icon: Clock,
  },
  APROVADO: {
    label: "Aprovado",
    className: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    Icon: CheckCircle2,
  },
  REPROVADO: {
    label: "Reprovado",
    className: "bg-red-100 text-red-900 ring-red-200",
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
    size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  const iconSize = size === "md" ? "h-4 w-4" : "h-3 w-3";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ring-1 ${className} ${sizeCls}`}
    >
      <Icon className={iconSize} />
      {label}
    </span>
  );
}
