"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Download, FileText, Loader2, Pencil, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currency, formatDate } from "@/lib/format";
import { approveOrderWithItems, rejectOrder } from "../actions";

export type ApprovalItem = {
  id: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  lastOrderedAt: string | null;
  lastPrice: number | null;
  lastSupplier: string | null;
  lastDeliveryDays: number | null;
};

export type ApprovalContext = {
  orderNumber: string;
  supplier: string;
  department: string;
  requester: string;
  reason: string;
  deliveryDays: number;
  items: ApprovalItem[];
};

type Props = {
  orderId: string;
  status: "AGUARDANDO" | "APROVADO" | "REPROVADO";
  isAdmin: boolean;
  approvalContext?: ApprovalContext;
};

export function OrderActionsBar({
  orderId,
  status,
  isAdmin,
  approvalContext,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [reason, setReason] = useState("");
  const canReview = isAdmin && status === "AGUARDANDO";

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
            onClick={() => setApproveOpen(true)}
            disabled={pending || !approvalContext}
            aria-label="Aprovar pedido"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="h-4 w-4" aria-hidden />
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
      {status === "APROVADO" && (
        <Button asChild variant="outline">
          <a
            href={`/pedidos/${orderId}/os`}
            target="_blank"
            rel="noopener"
            aria-label="Gerar Ordem de Serviço"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Gerar OS
          </a>
        </Button>
      )}

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
              placeholder="Ex.: Falta de orçamento aprovado para o setor…"
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
              aria-busy={pending}
            >
              {pending ? (
                <Loader2
                  className="h-4 w-4 motion-safe:animate-spin"
                  aria-hidden
                />
              ) : (
                <X className="h-4 w-4" aria-hidden />
              )}
              {pending ? "Reprovando…" : "Reprovar pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {approvalContext && (
        <ApproveDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          orderId={orderId}
          context={approvalContext}
        />
      )}
    </div>
  );
}

function ApproveDialog({
  open,
  onOpenChange,
  orderId,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  context: ApprovalContext;
}) {
  const [pending, startTransition] = useTransition();
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(context.items.map((i) => [i.id, String(i.quantity)])),
  );
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(context.items.map((i) => [i.id, String(i.unitPrice)])),
  );
  const [supplierName, setSupplierName] = useState<string>(context.supplier);
  const [deliveryDays, setDeliveryDays] = useState<string>(
    String(context.deliveryDays),
  );

  const numericQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const id of Object.keys(quantities)) {
      const v = Number(quantities[id]);
      map[id] = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    return map;
  }, [quantities]);

  const numericPrices = useMemo(() => {
    const map: Record<string, number> = {};
    for (const id of Object.keys(prices)) {
      const v = Number(prices[id]);
      map[id] = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    return map;
  }, [prices]);

  const numericDeliveryDays = useMemo(() => {
    const value = Number(deliveryDays);
    return Number.isInteger(value) && value > 0 ? value : 0;
  }, [deliveryDays]);

  const total = context.items.reduce(
    (sum, it) =>
      sum + (numericQuantities[it.id] ?? 0) * (numericPrices[it.id] ?? it.unitPrice),
    0,
  );
  const approvedCount = context.items.filter(
    (it) => (numericQuantities[it.id] ?? 0) > 0,
  ).length;

  const hasError = context.items.some((it) => {
    const q = numericQuantities[it.id] ?? 0;
    return !Number.isFinite(q) || q < 0;
  });
  const hasPriceError = context.items.some((it) => {
    const p = numericPrices[it.id] ?? it.unitPrice;
    return !Number.isFinite(p) || p < 0;
  });
  const hasDeliveryDaysError =
    !Number.isInteger(numericDeliveryDays) || numericDeliveryDays <= 0;

  function reset() {
    setQuantities(
      Object.fromEntries(context.items.map((i) => [i.id, String(i.quantity)])),
    );
    setPrices(
      Object.fromEntries(context.items.map((i) => [i.id, String(i.unitPrice)])),
    );
    setSupplierName(context.supplier);
    setDeliveryDays(String(context.deliveryDays));
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function onApprove() {
    if (approvedCount === 0) {
      toast.error("Mantenha ao menos 1 item para aprovar o pedido.");
      return;
    }
    if (hasError) {
      toast.error("Verifique as quantidades informadas.");
      return;
    }
    if (hasPriceError) {
      toast.error("Verifique os preços informados.");
      return;
    }
    if (hasDeliveryDaysError) {
      toast.error("Verifique o prazo informado.");
      return;
    }
    const items = context.items.map((it) => ({
      id: it.id,
      quantity: numericQuantities[it.id] ?? 0,
      unitPrice: numericPrices[it.id] ?? it.unitPrice,
    }));
    startTransition(async () => {
      try {
        await approveOrderWithItems(orderId, {
          supplierName,
          deliveryDays: numericDeliveryDays,
          items,
        });
        toast.success("Pedido aprovado.");
        onOpenChange(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        toast.error(msg);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Aprovar pedido {context.orderNumber}</DialogTitle>
          <DialogDescription>
            Ajuste as quantidades antes de aprovar. Use 0 para remover um item.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs sm:grid-cols-4">
          <Field label="Fornecedor">
            <Input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Prazo de entrega">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Departamento" value={context.department} />
          <Field label="Requisitante" value={context.requester} />
          <div className="col-span-full">
            <Field label="Motivo" value={context.reason} />
          </div>
        </dl>

        <div className="max-h-[55vh] overflow-y-auto overscroll-contain rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left font-semibold">Produto</th>
                <th className="p-2 text-right font-semibold">Solicitado</th>
                <th className="p-2 text-right font-semibold">Aprovar</th>
                <th className="p-2 text-right font-semibold">Preço unit.</th>
                <th className="p-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {context.items.map((it) => {
                const q = numericQuantities[it.id] ?? 0;
                const price = numericPrices[it.id] ?? it.unitPrice;
                const subtotal = q * price;
                const reduced = q < it.quantity;
                const removed = q === 0;
                return (
                  <tr
                    key={it.id}
                    className="border-t border-border align-top"
                  >
                    <td className="p-2">
                      <div className="font-medium">{it.productName}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span>Unid.: {it.unit}</span>
                        {it.lastOrderedAt && (
                          <span>
                            Última compra: {formatDate(it.lastOrderedAt)}
                            {it.lastPrice != null
                              ? ` — ${currency.format(it.lastPrice)}`
                              : ""}
                          </span>
                        )}
                        {it.lastSupplier && (
                          <span>Últ. fornecedor: {it.lastSupplier}</span>
                        )}
                        {it.lastDeliveryDays != null && (
                          <span>Últ. prazo: {it.lastDeliveryDays} dias</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-right font-mono tabular-nums text-muted-foreground">
                      {it.quantity} {it.unit}
                    </td>
                    <td className="p-2 text-right">
                      <Input
                        type="number"
                        inputMode="numeric"
                        autoComplete="off"
                        min={0}
                        step="1"
                        value={quantities[it.id] ?? ""}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [it.id]: e.target.value,
                          }))
                        }
                        aria-label={`Quantidade aprovada para ${it.productName}`}
                        className="ml-auto h-8 w-24 text-right font-mono tabular-nums"
                      />
                      {removed ? (
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-destructive">
                          Removido
                        </p>
                      ) : reduced ? (
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-600">
                          Reduzido
                        </p>
                      ) : null}
                    </td>
                    <td className="p-2 text-right font-mono tabular-nums text-muted-foreground">
                      <Input
                        type="number"
                        inputMode="decimal"
                        autoComplete="off"
                        min={0}
                        step="0.01"
                        value={prices[it.id] ?? ""}
                        onChange={(e) =>
                          setPrices((prev) => ({ ...prev, [it.id]: e.target.value }))
                        }
                        aria-label={`Preço unitário para ${it.productName}`}
                        className="ml-auto h-8 w-28 text-right font-mono tabular-nums"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-medium tabular-nums">
                      {currency.format(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/40">
                <td colSpan={4} className="p-2 text-right text-xs font-medium">
                  Total aprovado ({approvedCount} / {context.items.length}{" "}
                  itens)
                </td>
                <td className="p-2 text-right font-mono text-base font-bold tabular-nums">
                  {currency.format(total)}
                </td>
              </tr>
            </tfoot>
          </table>
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
            onClick={onApprove}
            disabled={
              pending ||
              approvedCount === 0 ||
              hasError ||
              hasPriceError ||
              hasDeliveryDaysError
            }
            aria-busy={pending}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {pending ? (
              <Loader2
                className="h-4 w-4 motion-safe:animate-spin"
                aria-hidden
              />
            ) : (
              <Check className="h-4 w-4" aria-hidden />
            )}
            {pending ? "Aprovando…" : "Aprovar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{children ?? value}</dd>
    </div>
  );
}
