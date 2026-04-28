import { Building2, ShieldCheck, Workflow } from "lucide-react";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <main className="flex flex-col justify-center bg-background px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Tecnosinter
              </p>
              <p className="text-base font-semibold">Sistema de Pedidos</p>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">
              Use suas credenciais corporativas para acessar o sistema.
            </p>
          </div>

          <LoginForm next={next ?? "/pedidos"} />

          <p className="text-xs text-muted-foreground">
            Esqueceu sua senha? Procure o administrador do setor para redefinir.
          </p>
        </div>
      </main>

      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex"
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, white 0px, transparent 1.5px), radial-gradient(circle at 75% 60%, white 0px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-sidebar-primary/10 to-transparent"
        />

        <div className="relative z-10 m-auto max-w-md space-y-10 px-12 py-16">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/80 ring-1 ring-sidebar-border">
              <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              Operação industrial
            </span>
            <h2 className="text-[28px] font-semibold leading-tight text-sidebar-accent-foreground">
              Pedidos auditáveis, do requisitante ao PDF assinado.
            </h2>
            <p className="text-sm text-sidebar-foreground/70">
              Centralize fornecedores, motivos e histórico de preços em um só
              lugar — com aprovação rastreável e geração de pedidos prontos
              para impressão.
            </p>
          </div>

          <ul className="space-y-4 text-sm">
            <FeatureItem
              icon={<Workflow className="h-4 w-4" />}
              title="Fluxo de aprovação"
              hint="Aguardando, aprovado ou reprovado — com motivo registrado."
            />
            <FeatureItem
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Controle por papel"
              hint="Administradores aprovam e gerenciam acessos."
            />
          </ul>
        </div>
      </aside>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-md bg-sidebar-accent/60 text-sidebar-primary ring-1 ring-sidebar-border">
        {icon}
      </span>
      <div className="leading-snug">
        <p className="font-medium text-sidebar-accent-foreground">{title}</p>
        <p className="text-sidebar-foreground/60">{hint}</p>
      </div>
    </li>
  );
}
