import { db } from "@/lib/db";
import { OrderForm } from "../order-form";
import { PageHeader } from "@/components/page-header";
import { getProductHistory } from "@/lib/product-history";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo pedido · Tecnosinter" };

export default async function NovoPedidoPage() {
  const [products, suppliers, departments, requesters, reasons, lastOrder] =
    await Promise.all([
      db.product.findMany({ orderBy: { name: "asc" } }),
      db.supplier.findMany({ orderBy: { name: "asc" } }),
      db.department.findMany({ orderBy: { name: "asc" } }),
      db.requester.findMany({ orderBy: { name: "asc" } }),
      db.reason.findMany({ orderBy: { description: "asc" } }),
      db.order.findFirst({
        orderBy: { orderedAt: "desc" },
        select: { orderNumber: true },
      }),
    ]);
  const history = await getProductHistory(products.map((p) => p.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Novo pedido"
        description="Cadastre um novo pedido com seus produtos. O PDF é gerado ao salvar."
        breadcrumbs={[
          { label: "Pedidos", href: "/pedidos" },
          { label: "Novo" },
        ]}
        backHref="/pedidos"
      />

      <OrderForm
        products={products.map((p) => ({
          name: p.name,
          unit: p.unit,
          lastPrice: p.lastPrice,
          lastOrderedAt: p.lastOrderedAt?.toISOString() ?? null,
          lastSupplier: history.get(p.id)?.lastSupplier ?? null,
          lastDeliveryDays: history.get(p.id)?.lastDeliveryDays ?? null,
        }))}
        suppliers={suppliers.map((s) => s.name)}
        departments={departments.map((d) => d.name)}
        requesters={requesters.map((r) => r.name)}
        reasons={reasons.map((r) => ({
          description: r.description,
          lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
          previousUsedAt: r.previousUsedAt?.toISOString() ?? null,
        }))}
        mode={{
          kind: "create",
          suggestedOrderNumber: nextOrderNumber(lastOrder?.orderNumber),
        }}
      />
    </div>
  );
}

function nextOrderNumber(last: string | undefined): string {
  const year = new Date().getFullYear().toString().slice(-2);
  if (!last) return `001/${year}`;
  const match = last.match(/^(\d+)\/(\d+)$/);
  if (!match) return `001/${year}`;
  const [, num, yr] = match;
  if (yr !== year) return `001/${year}`;
  const next = (Number.parseInt(num, 10) + 1).toString().padStart(3, "0");
  return `${next}/${year}`;
}
