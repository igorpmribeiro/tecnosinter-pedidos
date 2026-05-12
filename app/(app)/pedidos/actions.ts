"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth/dal";

const orderItemSchema = z.object({
  productName: z.string().trim().min(1, "Nome do produto é obrigatório"),
  unit: z.string().trim().min(1, "Unidade é obrigatória"),
  quantity: z.coerce.number().positive("Quantidade deve ser > 0"),
  unitPrice: z.coerce.number().nonnegative("Preço não pode ser negativo"),
});

const orderSchema = z.object({
  orderNumber: z.string().trim().min(1, "Número do pedido é obrigatório"),
  supplierName: z.string().trim().min(1, "Fornecedor é obrigatório"),
  departmentName: z.string().trim().min(1, "Departamento é obrigatório"),
  requesterName: z.string().trim().min(1, "Requisitante é obrigatório"),
  reasonDescription: z.string().trim().min(1, "Motivo é obrigatório"),
  deliveryDays: z.coerce.number().int().positive("Prazo inválido"),
  costCenter: z.string().trim().optional(),
  authorizedBy: z.string().trim().optional(),
  orderedAt: z.string().trim().optional(),
  items: z.array(orderItemSchema).min(1, "Adicione ao menos 1 produto"),
});

export type OrderInput = z.infer<typeof orderSchema>;

function parseLocalDate(value: string | undefined): Date {
  if (!value) return new Date();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(value);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
}

async function resolveOrderRefs(parsed: OrderInput, orderedAt: Date) {
  const [supplier, department, existingReason] = await Promise.all([
    db.supplier.upsert({
      where: { name: parsed.supplierName },
      update: {},
      create: { name: parsed.supplierName },
    }),
    db.department.upsert({
      where: { name: parsed.departmentName },
      update: {},
      create: { name: parsed.departmentName },
    }),
    db.reason.findUnique({ where: { description: parsed.reasonDescription } }),
  ]);

  const requester = await db.requester.upsert({
    where: {
      name_departmentId: {
        name: parsed.requesterName,
        departmentId: department.id,
      },
    },
    update: {},
    create: { name: parsed.requesterName, departmentId: department.id },
  });

  let reason;
  if (existingReason) {
    reason = await db.reason.update({
      where: { id: existingReason.id },
      data: {
        previousUsedAt: existingReason.lastUsedAt,
        lastUsedAt: orderedAt,
      },
    });
  } else {
    reason = await db.reason.create({
      data: {
        description: parsed.reasonDescription,
        lastUsedAt: orderedAt,
      },
    });
  }

  const itemsWithProducts = await Promise.all(
    parsed.items.map(async (item) => {
      const existingProduct = await db.product.findUnique({
        where: { name: item.productName },
      });
      const product = existingProduct
        ? await db.product.update({
            where: { id: existingProduct.id },
            data: {
              unit: item.unit,
              lastPrice: item.unitPrice,
              lastOrderedAt: orderedAt,
            },
          })
        : await db.product.create({
            data: {
              name: item.productName,
              unit: item.unit,
              lastPrice: item.unitPrice,
              lastOrderedAt: orderedAt,
            },
          });
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      };
    }),
  );

  return { supplier, department, requester, reason, itemsWithProducts };
}

export async function createOrder(raw: OrderInput) {
  const me = await requireUser();
  const parsed = orderSchema.parse(raw);
  const orderedAt = parseLocalDate(parsed.orderedAt);

  const existing = await db.order.findUnique({
    where: { orderNumber: parsed.orderNumber },
  });
  if (existing) throw new Error(`Pedido ${parsed.orderNumber} já existe.`);

  const { supplier, department, requester, reason, itemsWithProducts } =
    await resolveOrderRefs(parsed, orderedAt);

  const created = await db.order.create({
    data: {
      orderNumber: parsed.orderNumber,
      orderedAt,
      deliveryDays: parsed.deliveryDays,
      costCenter: parsed.costCenter || null,
      authorizedBy: parsed.authorizedBy || null,
      supplierId: supplier.id,
      departmentId: department.id,
      requesterId: requester.id,
      reasonId: reason.id,
      createdById: me.id,
      items: { create: itemsWithProducts },
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/produtos");
  revalidatePath("/motivos");
  redirect(`/pedidos/${created.id}`);
}

export async function updateOrder(orderId: string, raw: OrderInput) {
  await requireUser();
  const parsed = orderSchema.parse(raw);
  const orderedAt = parseLocalDate(parsed.orderedAt);

  const current = await db.order.findUnique({ where: { id: orderId } });
  if (!current) throw new Error("Pedido não encontrado.");

  if (parsed.orderNumber !== current.orderNumber) {
    const conflict = await db.order.findUnique({
      where: { orderNumber: parsed.orderNumber },
    });
    if (conflict) throw new Error(`Pedido ${parsed.orderNumber} já existe.`);
  }

  const { supplier, department, requester, reason, itemsWithProducts } =
    await resolveOrderRefs(parsed, orderedAt);

  await db.$transaction([
    db.orderItem.deleteMany({ where: { orderId } }),
    db.order.update({
      where: { id: orderId },
      data: {
        orderNumber: parsed.orderNumber,
        orderedAt,
        deliveryDays: parsed.deliveryDays,
        costCenter: parsed.costCenter || null,
        authorizedBy: parsed.authorizedBy || null,
        supplierId: supplier.id,
        departmentId: department.id,
        requesterId: requester.id,
        reasonId: reason.id,
        items: { create: itemsWithProducts },
      },
    }),
  ]);

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/produtos");
  revalidatePath("/motivos");
  redirect(`/pedidos/${orderId}`);
}

export async function approveOrder(orderId: string): Promise<void> {
  const me = await requireAdmin();
  await db.order.update({
    where: { id: orderId },
    data: {
      status: "APROVADO",
      rejectionReason: null,
      reviewedAt: new Date(),
      reviewedById: me.id,
    },
  });
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
}

const approveItemsSchema = z.object({
  supplierName: z.string().trim().optional(),
  deliveryDays: z.coerce.number().int().positive().optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.coerce
          .number()
          .nonnegative("Quantidade não pode ser negativa"),
        unitPrice: z.coerce.number().nonnegative().optional(),
      }),
    )
    .min(1, "Informe ao menos 1 item."),
});

export type ApproveOrderInput = z.infer<typeof approveItemsSchema>;

export async function approveOrderWithItems(
  orderId: string,
  raw: ApproveOrderInput,
): Promise<void> {
  const me = await requireAdmin();
  const parsed = approveItemsSchema.parse(raw);

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, supplier: true },
  });
  if (!order) throw new Error("Pedido não encontrado.");
  if (order.status !== "AGUARDANDO")
    throw new Error("Este pedido já foi revisado.");

  const itemMap = new Map(order.items.map((i) => [i.id, i]));
  for (const incoming of parsed.items) {
    if (!itemMap.has(incoming.id))
      throw new Error("Item não pertence a este pedido.");
  }

  const remaining = parsed.items.filter((i) => i.quantity > 0).length;
  if (remaining === 0)
    throw new Error("É necessário manter ao menos 1 item aprovado.");

  const itemOps = parsed.items.flatMap((incoming) => {
    const current = itemMap.get(incoming.id)!;
    if (incoming.quantity === 0) {
      return [db.orderItem.delete({ where: { id: incoming.id } })];
    }

    const finalQty = incoming.quantity;
    const finalPrice = incoming.unitPrice ?? current.unitPrice;
    const updates: Record<string, unknown> = {};
    if (finalQty !== current.quantity) updates.quantity = finalQty;
    if (finalPrice !== current.unitPrice) updates.unitPrice = finalPrice;
    if (Object.keys(updates).length > 0) {
      updates.totalPrice = finalQty * finalPrice;
      return [
        db.orderItem.update({
          where: { id: incoming.id },
          data: updates,
        }),
      ];
    }
    return [];
  });

  const orderData: Record<string, unknown> = {
    status: "APROVADO",
    rejectionReason: null,
    reviewedAt: new Date(),
    reviewedById: me.id,
  };

  if (parsed.deliveryDays) {
    orderData.deliveryDays = parsed.deliveryDays;
  }

  if (parsed.supplierName && parsed.supplierName !== order.supplier?.name) {
    const supplier = await db.supplier.upsert({
      where: { name: parsed.supplierName },
      update: {},
      create: { name: parsed.supplierName },
    });
    orderData.supplierId = supplier.id;
  }

  const orderUpdate = db.order.update({
    where: { id: orderId },
    data: orderData,
  });

  await db.$transaction([...itemOps, orderUpdate]);
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
}

export async function rejectOrder(
  orderId: string,
  reason: string,
): Promise<void> {
  const me = await requireAdmin();
  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Informe o motivo da reprovação.");

  await db.order.update({
    where: { id: orderId },
    data: {
      status: "REPROVADO",
      rejectionReason: trimmed,
      reviewedAt: new Date(),
      reviewedById: me.id,
    },
  });
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
}
