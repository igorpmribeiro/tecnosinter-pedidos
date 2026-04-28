"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

const PRESETS: { value: Preset; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "month", label: "Mês atual" },
  { value: "previous-month", label: "Mês passado" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "custom", label: "Personalizado" },
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
      const orderedDate = new Date(o.orderedAt);
      if (range.from && orderedDate < range.from) return false;
      if (range.to && orderedDate > range.to) return false;
      if (!term) return true;
      return [o.orderNumber, o.supplier, o.department, o.requester]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, range]);

  return (
    <Card className="pb-0 overflow-hidden">
      <CardHeader className="gap-4">
        <div className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Todos os pedidos</CardTitle>
            <CardDescription>
              {filtered.length} de {rows.length} exibidos.
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nº, fornecedor, depto..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                type="button"
                size="sm"
                variant={preset === p.value ? "default" : "outline"}
                onClick={() => setPreset(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="from" className="text-xs">
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
                <Label htmlFor="to" className="text-xs">
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Depto.</TableHead>
              <TableHead>Requisitante</TableHead>
              <TableHead className="text-right">Itens</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
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
                  className="cursor-pointer transition-colors hover:bg-muted/60"
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
                  <TableCell>{o.supplier}</TableCell>
                  <TableCell>{o.department}</TableCell>
                  <TableCell>{o.requester}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
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
      </CardContent>
    </Card>
  );
}
