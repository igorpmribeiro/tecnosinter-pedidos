"use client";

import { useActionState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser, type CreateUserState } from "../actions";

export function NewUserForm() {
  const [state, action, pending] = useActionState<
    CreateUserState | undefined,
    FormData
  >(createUser, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do usuário</CardTitle>
        <CardDescription>
          O usuário receberá acesso imediatamente após o cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" name="name" required autoComplete="name" />
            {state?.fieldErrors?.name?.[0] && (
              <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            {state?.fieldErrors?.email?.[0] && (
              <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Papel</Label>
            <select
              id="role"
              name="role"
              defaultValue="FUNCIONARIO"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="FUNCIONARIO">Funcionário</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {state?.fieldErrors?.role?.[0] && (
              <p className="text-xs text-destructive">{state.fieldErrors.role[0]}</p>
            )}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="password">Senha (mínimo 8 caracteres)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {state?.fieldErrors?.password?.[0] && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          {state?.error && (
            <p className="md:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Criar usuário"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
