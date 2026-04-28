"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { cn } from "@/lib/utils";

export type OrderRow = {
  id: string;
  orderNumber: string;
  orderedAt: string;
  supplier: string;
  department: string;
  requester: string;
  itemCount: number;
  total: number;
  status: "AGUARDANDO" | "APROVADO" | "REPROVADO";
};

type Preset = "month" | "previous-month" | "15d" | "7d" | "custom" | "all";
type StatusFilter = "all" | OrderRow["status"];

const PRESETS: { value: Preset; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "month", label: "Mês atual" },
  { value: "previous-month", label: "Mês passado" },
  { value: "15d", label: "15 dias" },
  { value: "7d", label: "7 dias" },
  { value: "custom", label: "Personalizado" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "APROVADO", label: "Aprovados" },
  { value: "REPROVADO", label: "Reprovados" },
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function parseLocalIso(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
}
function rangeForPreset(preset: Preset): { from: Date | null; to: Date | null } {
  const now = new Date();
  if (preset === "all" || preset === "custom") return { from: null, to: null };
  if (preset === "month") {
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }
  if (preset === "previous-month") {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: startOfDay(first), to: endOfDay(last) };
  }
  const days = preset === "15d" ? 15 : 7;
  const from = new Date(now);
  from.setDate(now.getDate() - (days - 1));
  return { from: startOfDay(from), to: endOfDay(now) };
}

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [q, setQ] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const today = isoDate(new Date());
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const router = useRouter();

  const range = useMemo(() => {
    if (preset === "custom") {
      const from = parseLocalIso(customFrom);
      const to = parseLocalIso(customTo);
      return {
        from: from ? startOfDay(from) : null,
        to: to ? endOfDay(to) : null,
      };
    }
    return rangeForPreset(preset);
  }, [preset, customFrom, customTo]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      const orderedDate = new Date(o.orderedAt);
      if (range.from && orderedDate < range.from) return false;
      if (range.to && orderedDate > range.to) return false;
      if (!term) return true;
      return [o.orderNumber, o.supplier, o.department, o.requester]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, range, statusFilter]);

  return (
    <Card className="overflow-hidden pb-0">
      <CardHeader className="gap-4 border-b border-border bg-muted/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Todos os pedidos</CardTitle>
            <CardDescription>
              {filtered.length} de {rows.length}{" "}
              {rows.length === 1 ? "registro" : "registros"} exibidos.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nº, fornecedor, depto..."
              className="pl-9"
              aria-label="Buscar pedidos"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filtrar por período"
          >
            <span className="inline-flex items-center gap-1.5 pr-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <SlidersHorizontal className="h-3 w-3" aria-hidden />
              Período
            </span>
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                type="button"
                size="sm"
                variant={preset === p.value ? "default" : "outline"}
                onClick={() => setPreset(p.value)}
                aria-pressed={preset === p.value}
                className="h-7 rounded-full px-3 text-xs"
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filtrar por status"
          >
            <span className="pr-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Status
            </span>
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s.value}
                type="button"
                size="sm"
                variant={statusFilter === s.value ? "default" : "outline"}
                onClick={() => setStatusFilter(s.value)}
                aria-pressed={statusFilter === s.value}
                className="h-7 rounded-full px-3 text-xs"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="from" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                De
              </Label>
              <Input
                id="from"
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Até
              </Label>
              <Input
                id="to"
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Nº pedido
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Data
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Fornecedor
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Depto.
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Requisitante
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                  Itens
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    {rows.length === 0
                      ? "Nenhum pedido registrado ainda."
                      : "Nenhum pedido encontrado para os filtros aplicados."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow
                    key={o.id}
                    onClick={() => router.push(`/pedidos/${o.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/pedidos/${o.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                    aria-label={`Abrir pedido ${o.orderNumber}`}
                    className={cn(
                      "cursor-pointer border-border transition-colors",
                      "hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    )}
                  >
                    <TableCell className="font-mono font-medium">
                      {o.orderNumber}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDate(o.orderedAt)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="font-medium">{o.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.department}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o.requester}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {o.itemCount}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold tabular-nums">
                      {currency.format(o.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
