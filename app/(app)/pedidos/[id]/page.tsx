import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth/dal";
import { OrderActionsBar } from "./order-actions-bar";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireUser();
  const order = await db.order.findUnique({
    where: { id },
    include: {
      supplier: true,
      department: true,
      requester: true,
      reason: true,
      reviewedBy: { select: { name: true } },
      createdBy: { select: { name: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  const total = order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const lastPurchaseItem = order.items.reduce<Date | null>((max, i) => {
    const d = i.product.lastOrderedAt;
    if (!d) return max;
    if (!max || d > max) return d;
    return max;
  }, null);

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="inline-flex items-baseline gap-2">
            Pedido
            <span className="font-mono text-foreground/70">
              {order.orderNumber}
            </span>
          </span>
        }
        description={
          <>
            Emitido em{" "}
            <span className="font-mono">{formatDate(order.orderedAt)}</span> ·{" "}
            {order.supplier.name}
          </>
        }
        breadcrumbs={[
          { label: "Pedidos", href: "/pedidos" },
          { label: order.orderNumber },
        ]}
        backHref="/pedidos"
        meta={<OrderStatusBadge status={order.status} size="md" />}
        actions={
          <OrderActionsBar
            orderId={order.id}
            status={order.status}
            isAdmin={me.role === "ADMIN"}
          />
        }
      />

      {order.status === "REPROVADO" && order.rejectionReason && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50/70 p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-900/70">
            Motivo da reprovação
          </p>
          <p className="mt-1.5 text-sm text-red-950">{order.rejectionReason}</p>
          {order.reviewedBy && order.reviewedAt && (
            <p className="mt-2 text-xs text-red-900/70">
              Reprovado por <strong>{order.reviewedBy.name}</strong> em{" "}
              {formatDate(order.reviewedAt)}.
            </p>
          )}
        </div>
      )}

      {order.status === "APROVADO" && order.reviewedBy && order.reviewedAt && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900"
        >
          Aprovado por <strong>{order.reviewedBy.name}</strong> em{" "}
          {formatDate(order.reviewedAt)}.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard
          title="Dados de origem"
          items={[
            ["Fornecedor", order.supplier.name],
            ["Departamento", order.department.name],
            ["Requisitante", order.requester.name],
            ["Centro de custo", order.costCenter ?? "—"],
            ["Prazo de entrega", `${order.deliveryDays} dias`],
            ["Criado por", order.createdBy?.name ?? "—"],
          ]}
        />
        <InfoCard
          title="Aplicação / Histórico"
          items={[
            ["Motivo", order.reason.description],
            ["Última troca", formatDate(order.reason.lastUsedAt)],
            ["Penúltima troca", formatDate(order.reason.previousUsedAt)],
            ["Última compra do item", formatDate(lastPurchaseItem)],
            ["Autorizado por", order.authorizedBy ?? "—"],
          ]}
        />
        <Card>
          <CardHeader className="border-b border-border bg-muted/40 py-3">
            <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Resumo financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-5">
            <div>
              <p className="text-xs text-muted-foreground">Total do pedido</p>
              <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                {currency.format(total)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Itens
                </dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">
                  {order.items.length}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Quantidade
                </dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">
                  {order.items.reduce((s, i) => s + i.quantity, 0)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden pb-0">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-base">Itens do pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Qtd.
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Unid.
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Descrição
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                    Preço unit.
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                    Preço total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((it, i) => (
                  <TableRow key={it.id} className="border-border">
                    <TableCell className="font-mono text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {it.quantity}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {it.product.unit}
                    </TableCell>
                    <TableCell className="font-medium">
                      {it.product.name}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {currency.format(it.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium tabular-nums">
                      {currency.format(it.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t border-border bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={5} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg font-bold tabular-nums">
                    {currency.format(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/40 py-3">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-foreground">
              {value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
