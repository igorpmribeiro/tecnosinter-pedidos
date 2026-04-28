"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Algo deu errado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente em alguns
        segundos.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground/70">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
