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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency, formatDate } from "@/lib/format";

export type OrderRow = {
  id: string;
  orderNumber: string;
  orderedAt: string;
  supplier: string;
  department: string;
  requester: string;
  itemCount: number;
  total: number;
};

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((o) =>
      [o.orderNumber, o.supplier, o.department, o.requester]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [rows, q]);

  return (
    <Card className="pb-0 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
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
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Pedido</TableHead>
              <TableHead>Data</TableHead>
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
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  {rows.length === 0
                    ? "Nenhum pedido registrado ainda."
                    : "Nenhum pedido encontrado para a busca."}
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
