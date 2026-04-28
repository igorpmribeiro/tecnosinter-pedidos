import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { renderOrderPdf } from "@/lib/pdf/order-pdf";

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
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) notFound();

  const buffer = await renderOrderPdf(order);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pedido-${order.orderNumber.replace("/", "-")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
