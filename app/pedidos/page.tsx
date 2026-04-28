import Link from "next/link";
import { Plus, ClipboardList, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { currency, formatDate } from "@/lib/format";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const orders = await db.order.findMany({
    orderBy: { orderedAt: "desc" },
    include: {
      supplier: true,
      department: true,
      requester: true,
      reason: true,
      items: true,
    },
  });

  const rows = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    orderedAt: o.orderedAt.toISOString(),
    supplier: o.supplier.name,
    department: o.department.name,
    requester: o.requester.name,
    itemCount: o.items.length,
    total: o.items.reduce((sum, item) => sum + item.totalPrice, 0),
  }));

  const totalValue = rows.reduce((sum, o) => sum + o.total, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthOrders = rows.filter(
    (o) => new Date(o.orderedAt) >= startOfMonth,
  );
  const monthValue = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const lastOrder = rows[0];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de pedidos internos do setor.
          </p>
        </div>
        <Button asChild>
          <Link href="/pedidos/novo">
            <Plus className="h-4 w-4" />
            Adicionar pedido
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de pedidos"
          value={rows.length.toString()}
          hint={
            lastOrder
              ? `Último: ${lastOrder.orderNumber} em ${formatDate(lastOrder.orderedAt)}`
              : "Nenhum pedido ainda"
          }
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Valor acumulado"
          value={currency.format(totalValue)}
          hint={`Em ${rows.length} ${rows.length === 1 ? "pedido" : "pedidos"}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Pedidos no mês"
          value={monthOrders.length.toString()}
          hint={`Mês atual — desde ${formatDate(startOfMonth)}`}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Valor no mês"
          value={currency.format(monthValue)}
          hint={monthOrders.length === 0 ? "Sem pedidos no mês" : "Acumulado mensal"}
          icon={<TrendingUp className="h-4 w-4" />}
          accent
        />
      </div>

      <OrdersTable rows={rows} />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span
          className={
            accent
              ? "grid h-7 w-7 place-items-center rounded-md bg-accent/20 text-accent-foreground"
              : "grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"
          }
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
