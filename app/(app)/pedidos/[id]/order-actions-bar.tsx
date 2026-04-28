"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Download, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveOrder, rejectOrder } from "../actions";

type Props = {
  orderId: string;
  status: "AGUARDANDO" | "APROVADO" | "REPROVADO";
  isAdmin: boolean;
};

export function OrderActionsBar({ orderId, status, isAdmin }: Props) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const canReview = isAdmin && status === "AGUARDANDO";

  function onApprove() {
    if (!confirm("Confirmar aprovação deste pedido?")) return;
    startTransition(async () => {
      try {
        await approveOrder(orderId);
        toast.success("Pedido aprovado.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        toast.error(msg);
      }
    });
  }

  function onReject() {
    if (!reason.trim()) {
      toast.error("Informe o motivo da reprovação.");
      return;
    }
    startTransition(async () => {
      try {
        await rejectOrder(orderId, reason);
        toast.success("Pedido reprovado.");
        setRejectOpen(false);
        setReason("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        toast.error(msg);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canReview && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectOpen(true)}
            disabled={pending}
            aria-label="Reprovar pedido"
          >
            <X className="h-4 w-4" aria-hidden />
            Reprovar
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            disabled={pending}
            aria-label="Aprovar pedido"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Check className="h-4 w-4" aria-hidden />
            )}
            Aprovar
          </Button>
        </>
      )}
      <Button asChild variant="outline">
        <Link href={`/pedidos/${orderId}/editar`} aria-label="Editar pedido">
          <Pencil className="h-4 w-4" aria-hidden />
          Editar
        </Link>
      </Button>
      <Button asChild>
        <a
          href={`/pedidos/${orderId}/pdf`}
          target="_blank"
          rel="noopener"
          aria-label="Baixar PDF do pedido"
        >
          <Download className="h-4 w-4" aria-hidden />
          Baixar PDF
        </a>
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reprovar pedido</DialogTitle>
            <DialogDescription>
              Informe o motivo. Ele ficará registrado no histórico do pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason">Motivo</Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Ex.: Falta de orçamento aprovado para o setor."
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button" disabled={pending}>
                  Cancelar
                </Button>
              }
            />
            <Button
              type="button"
              variant="destructive"
              onClick={onReject}
              disabled={pending || !reason.trim()}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <X className="h-4 w-4" aria-hidden />
              )}
              Reprovar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
