import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MotivosPage() {
  const reasons = await db.reason.findMany({
    orderBy: [{ lastUsedAt: "desc" }, { description: "asc" }],
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Motivos</h1>
        <p className="text-muted-foreground">
          Aplicações / motivos de pedidos. Última e penúltima data são
          atualizadas automaticamente a cada novo pedido.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de aplicações</CardTitle>
          <CardDescription>
            {reasons.length} {reasons.length === 1 ? "motivo" : "motivos"}{" "}
            registrado{reasons.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motivo / Aplicação</TableHead>
                <TableHead>Última troca</TableHead>
                <TableHead>Penúltima troca</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum motivo registrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                reasons.map((r) => (
                  <TableRow key={r.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {r.description}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDate(r.lastUsedAt)}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDate(r.previousUsedAt)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {r._count.orders}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
