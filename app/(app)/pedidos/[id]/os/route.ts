import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { renderServiceOrderPdf } from "@/lib/pdf/service-order-pdf";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      supplier: true,
      department: true,
      requester: true,
      reason: true,
      reviewedBy: { select: { name: true } },
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) notFound();
  if (order.status !== "APROVADO") {
    return new Response(
      "A Ordem de Serviço só pode ser gerada para pedidos aprovados.",
      { status: 409 },
    );
  }

  const buffer = await renderServiceOrderPdf(order);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="OS-${order.orderNumber.replace("/", "-")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
