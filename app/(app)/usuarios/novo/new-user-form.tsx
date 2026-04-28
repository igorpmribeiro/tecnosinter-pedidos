"use client";

import { useActionState } from "react";
import { Loader2, Shield, User as UserIcon } from "lucide-react";
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
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/40">
        <CardTitle className="text-base">Dados do usuário</CardTitle>
        <CardDescription>
          O usuário receberá acesso imediatamente após o cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Ex.: Henrique Tiago"
            />
            {state?.fieldErrors?.name?.[0] && (
              <p
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {state.fieldErrors.name[0]}
              </p>
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
              placeholder="nome@tecnosinter.com"
            />
            {state?.fieldErrors?.email?.[0] && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium leading-none">Papel</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <RoleOption value="FUNCIONARIO" defaultChecked label="Funcionário" hint="Apenas registra pedidos" Icon={UserIcon} />
              <RoleOption value="ADMIN" label="Administrador" hint="Aprova pedidos e gerencia usuários" Icon={Shield} />
            </div>
            {state?.fieldErrors?.role?.[0] && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.fieldErrors.role[0]}
              </p>
            )}
          </fieldset>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="password-help"
            />
            <p id="password-help" className="text-xs text-muted-foreground">
              Mínimo de 8 caracteres. Compartilhe com o usuário por um canal
              seguro.
            </p>
            {state?.fieldErrors?.password?.[0] && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          {state?.error && (
            <p
              role="alert"
              className="md:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              {state.error}
            </p>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {pending ? "Salvando..." : "Criar usuário"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function RoleOption({
  value,
  label,
  hint,
  defaultChecked,
  Icon,
}: {
  value: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
  Icon: typeof UserIcon;
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-foreground/20 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input
        type="radio"
        name="role"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </label>
  );
}
