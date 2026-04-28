"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
};

export async function login(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return { error: "Credenciais inválidas." };

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Credenciais inválidas." };

  await createSession({ userId: user.id, role: user.role, name: user.name });
  const next = (formData.get("next") as string | null) || "/pedidos";
  redirect(next.startsWith("/") ? next : "/pedidos");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
