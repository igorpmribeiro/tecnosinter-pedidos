import { requireAdmin } from "@/lib/auth/dal";
import { PageHeader } from "@/components/page-header";
import { NewUserForm } from "./new-user-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo usuário · Tecnosinter" };

export default async function NovoUsuarioPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Novo usuário"
        description="Cadastre um novo usuário e defina seu papel no sistema."
        breadcrumbs={[
          { label: "Usuários", href: "/usuarios" },
          { label: "Novo" },
        ]}
        backHref="/usuarios"
      />

      <NewUserForm />
    </div>
  );
}
