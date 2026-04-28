import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted text-foreground/70 ring-1 ring-border">
        <FileQuestion className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Pedido não encontrado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esse número de pedido não existe ou foi removido. Verifique a listagem.
      </p>
      <div className="mt-6 flex justify-center">
        <Button asChild>
          <Link href="/pedidos">Voltar para pedidos</Link>
        </Button>
      </div>
    </div>
  );
}
