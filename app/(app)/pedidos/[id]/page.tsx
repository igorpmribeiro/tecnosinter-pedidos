import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Pedido <span className="font-mono">{order.orderNumber}</span>
            </h1>
            <OrderStatusBadge status={order.status} size="md" />
          </div>
          <p className="text-muted-foreground">
            <span className="font-mono">{formatDate(order.orderedAt)}</span> ·{" "}
            {order.supplier.name}
          </p>
        </div>
        <OrderActionsBar
          orderId={order.id}
          status={order.status}
          isAdmin={me.role === "ADMIN"}
        />
      </div>

      {order.status === "REPROVADO" && order.rejectionReason && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-900">
            Motivo da reprovação
          </p>
          <p className="mt-1 text-sm text-red-900">{order.rejectionReason}</p>
          {order.reviewedBy && order.reviewedAt && (
            <p className="mt-2 text-xs text-red-900/70">
              Reprovado por {order.reviewedBy.name} em{" "}
              {formatDate(order.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {order.status === "APROVADO" && order.reviewedBy && order.reviewedAt && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-900">
          Aprovado por <strong>{order.reviewedBy.name}</strong> em{" "}
          {formatDate(order.reviewedAt)}.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
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
          items={[
            ["Aplicação / Motivo", order.reason.description],
            ["Última troca (motivo)", formatDate(order.reason.lastUsedAt)],
            [
              "Penúltima troca (motivo)",
              formatDate(order.reason.previousUsedAt),
            ],
            [
              "Última compra (item mais recente)",
              formatDate(lastPurchaseItem),
            ],
            ["Autorizado por", order.authorizedBy ?? "—"],
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Unid.</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Preço unit.</TableHead>
                <TableHead className="text-right">Preço total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it, i) => (
                <TableRow key={it.id}>
                  <TableCell className="font-mono">{i + 1}</TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {it.quantity}
                  </TableCell>
                  <TableCell className="font-mono">{it.product.unit}</TableCell>
                  <TableCell className="font-medium">{it.product.name}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {currency.format(it.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {currency.format(it.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40">
                <TableCell colSpan={5} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono text-lg font-bold tabular-nums">
                  {currency.format(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ items }: { items: [string, string][] }) {
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
