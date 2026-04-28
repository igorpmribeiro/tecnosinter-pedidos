import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[40vh] place-items-center text-muted-foreground"
    >
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Carregando…</span>
      </div>
    </div>
  );
}
