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
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Motivos · Tecnosinter" };

export default async function MotivosPage() {
  const reasons = await db.reason.findMany({
    orderBy: [{ lastUsedAt: "desc" }, { description: "asc" }],
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Motivos"
        description="Aplicações / motivos de pedidos. Última e penúltima data são atualizadas automaticamente a cada novo pedido."
        breadcrumbs={[{ label: "Tecnosinter" }, { label: "Motivos" }]}
      />

      <Card className="overflow-hidden pb-0">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-base">Histórico de aplicações</CardTitle>
          <CardDescription>
            {reasons.length} {reasons.length === 1 ? "motivo" : "motivos"}{" "}
            registrado{reasons.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Motivo / Aplicação
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Última troca
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Penúltima troca
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                    Pedidos
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reasons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-16 text-center text-sm text-muted-foreground"
                    >
                      Nenhum motivo registrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  reasons.map((r) => (
                    <TableRow
                      key={r.id}
                      className="border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {r.description}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {formatDate(r.lastUsedAt)}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {formatDate(r.previousUsedAt)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {r._count.orders}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
