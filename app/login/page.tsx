import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
          T
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tecnosinter</p>
          <h1 className="text-xl font-semibold">Sistema de Pedidos</h1>
        </div>
      </div>

      <LoginForm next={next ?? "/pedidos"} />
    </div>
  );
}
