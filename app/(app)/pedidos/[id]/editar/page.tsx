import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { OrderForm } from "../../order-form";

export const dynamic = "force-dynamic";

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, products, suppliers, departments, requesters, reasons] =
    await Promise.all([
      db.order.findUnique({
        where: { id },
        include: {
          supplier: true,
          department: true,
          requester: true,
          reason: true,
          items: { include: { product: true }, orderBy: { id: "asc" } },
        },
      }),
      db.product.findMany({ orderBy: { name: "asc" } }),
      db.supplier.findMany({ orderBy: { name: "asc" } }),
      db.department.findMany({ orderBy: { name: "asc" } }),
      db.requester.findMany({ orderBy: { name: "asc" } }),
      db.reason.findMany({ orderBy: { description: "asc" } }),
    ]);

  if (!order) notFound();

  const orderedAtIso = order.orderedAt.toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="inline-flex items-baseline gap-2">
            Editar pedido
            <span className="font-mono text-foreground/70">
              {order.orderNumber}
            </span>
          </span>
        }
        description="Altere os dados ou itens. As alterações refletem no PDF."
        breadcrumbs={[
          { label: "Pedidos", href: "/pedidos" },
          { label: order.orderNumber, href: `/pedidos/${order.id}` },
          { label: "Editar" },
        ]}
        backHref={`/pedidos/${order.id}`}
      />

      <OrderForm
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
        mode={{
          kind: "edit",
          orderId: order.id,
          initial: {
            orderNumber: order.orderNumber,
            orderedAt: orderedAtIso,
            supplierName: order.supplier.name,
            departmentName: order.department.name,
            requesterName: order.requester.name,
            reasonDescription: order.reason.description,
            deliveryDays: order.deliveryDays,
            costCenter: order.costCenter ?? "",
            authorizedBy: order.authorizedBy ?? "",
            items: order.items.map((it) => ({
              productName: it.product.name,
              unit: it.product.unit,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
          },
        }}
      />
    </div>
  );
}
