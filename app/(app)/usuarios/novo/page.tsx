import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/dal";
import { NewUserForm } from "./new-user-form";

export const dynamic = "force-dynamic";

export default async function NovoUsuarioPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/usuarios">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo usuário</h1>
        <p className="text-muted-foreground">
          Cadastre um novo usuário e defina seu papel no sistema.
        </p>
      </div>

      <NewUserForm />
    </div>
  );
}
