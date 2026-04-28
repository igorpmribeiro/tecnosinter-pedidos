import Link from "next/link";
import {
  Plus,
  ClipboardList,
  DollarSign,
  CalendarRange,
  Clock,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { currency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
    status: o.status,
  }));

  const totalValue = rows.reduce((sum, o) => sum + o.total, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthOrders = rows.filter(
    (o) => new Date(o.orderedAt) >= startOfMonth,
  );
  const monthValue = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = rows.filter((o) => o.status === "AGUARDANDO").length;
  const lastOrder = rows[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pedidos"
        description="Acompanhe, aprove e registre os pedidos internos do setor de manutenção e suprimentos."
        breadcrumbs={[{ label: "Tecnosinter" }, { label: "Pedidos" }]}
        actions={
          <Button asChild>
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4" aria-hidden />
              Novo pedido
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Indicadores"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total de pedidos"
          value={rows.length}
          hint={
            lastOrder
              ? `Último ${lastOrder.orderNumber} em ${formatDate(lastOrder.orderedAt)}`
              : "Nenhum pedido ainda"
          }
          icon={ClipboardList}
        />
        <StatCard
          label="Valor acumulado"
          value={currency.format(totalValue)}
          hint={`Em ${rows.length} ${rows.length === 1 ? "pedido" : "pedidos"} registrados`}
          icon={DollarSign}
        />
        <StatCard
          label="Pedidos no mês"
          value={monthOrders.length}
          hint={`${currency.format(monthValue)} desde ${formatDate(startOfMonth)}`}
          icon={CalendarRange}
          intent="primary"
        />
        <StatCard
          label="Aguardando aprovação"
          value={pendingCount}
          hint={
            pendingCount === 0
              ? "Nenhum pedido pendente"
              : pendingCount === 1
                ? "1 pedido para revisar"
                : `${pendingCount} pedidos para revisar`
          }
          icon={Clock}
          intent={pendingCount > 0 ? "warning" : "neutral"}
        />
      </section>

      <OrdersTable rows={rows} />
    </div>
  );
}
