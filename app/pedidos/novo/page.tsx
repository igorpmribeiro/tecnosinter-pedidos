import { db } from "@/lib/db";
import { NewOrderForm } from "./new-order-form";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo pedido</h1>
        <p className="text-muted-foreground">
          Cadastre um novo pedido e seus produtos. O PDF é gerado ao salvar.
        </p>
      </div>

      <NewOrderForm
        products={products.map((p) => ({
          name: p.name,
          unit: p.unit,
          lastPrice: p.lastPrice,
          lastOrderedAt: p.lastOrderedAt?.toISOString() ?? null,
        }))}
        suppliers={suppliers.map((s) => s.name)}
        departments={departments.map((d) => d.name)}
        requesters={requesters.map((r) => r.name)}
        reasons={reasons.map((r) => ({
          description: r.description,
          lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
          previousUsedAt: r.previousUsedAt?.toISOString() ?? null,
        }))}
        suggestedOrderNumber={nextOrderNumber(lastOrder?.orderNumber)}
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
