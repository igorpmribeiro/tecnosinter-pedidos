import "server-only";
import { db } from "@/lib/db";

export type ProductHistoryEntry = {
  lastSupplier: string;
  lastDeliveryDays: number;
};

export async function getProductHistory(
  productIds?: string[],
): Promise<Map<string, ProductHistoryEntry>> {
  const items = await db.orderItem.findMany({
    where:
      productIds && productIds.length > 0
        ? { productId: { in: productIds } }
        : undefined,
    orderBy: [{ order: { orderedAt: "desc" } }, { id: "desc" }],
    select: {
      productId: true,
      order: {
        select: {
          deliveryDays: true,
          supplier: { select: { name: true } },
        },
      },
    },
  });

  const map = new Map<string, ProductHistoryEntry>();
  for (const it of items) {
    if (map.has(it.productId)) continue;
    map.set(it.productId, {
      lastSupplier: it.order.supplier.name,
      lastDeliveryDays: it.order.deliveryDays,
    });
  }
  return map;
}
