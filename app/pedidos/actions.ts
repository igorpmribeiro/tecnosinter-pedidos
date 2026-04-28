"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";

const orderItemSchema = z.object({
  productName: z.string().trim().min(1, "Nome do produto é obrigatório"),
  unit: z.string().trim().min(1, "Unidade é obrigatória"),
  quantity: z.coerce.number().positive("Quantidade deve ser > 0"),
  unitPrice: z.coerce.number().nonnegative("Preço não pode ser negativo"),
});

const createOrderSchema = z.object({
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

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

function parseLocalDate(value: string | undefined): Date {
  if (!value) return new Date();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(value);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
}

export async function createOrder(raw: CreateOrderInput) {
  const parsed = createOrderSchema.parse(raw);
  const orderedAt = parseLocalDate(parsed.orderedAt);

  const [existing, supplier, department, existingReason] = await Promise.all([
    db.order.findUnique({ where: { orderNumber: parsed.orderNumber } }),
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

  if (existing) {
    throw new Error(`Pedido ${parsed.orderNumber} já existe.`);
  }

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
      items: { create: itemsWithProducts },
    },
  });

  revalidatePath("/pedidos");
  revalidatePath("/produtos");
  revalidatePath("/motivos");
  redirect(`/pedidos/${created.id}`);
}
