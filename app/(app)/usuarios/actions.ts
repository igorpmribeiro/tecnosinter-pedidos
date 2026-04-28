"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/dal";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: z.enum(["ADMIN", "FUNCIONARIO"]),
});

export type CreateUserState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "role", string[]>>;
};

export async function createUser(
  _prev: CreateUserState | undefined,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { error: "Já existe um usuário com este email." };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function deleteUser(userId: string): Promise<void> {
  const me = await requireAdmin();
  if (me.id === userId) throw new Error("Você não pode excluir sua própria conta.");

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/usuarios");
}
