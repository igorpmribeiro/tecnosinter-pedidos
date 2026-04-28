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
import { currency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const products = await db.product.findMany({
    orderBy: [{ lastOrderedAt: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Produtos"
        description="Histórico de produtos pedidos. Os produtos são cadastrados automaticamente ao serem usados em um pedido."
        breadcrumbs={[{ label: "Tecnosinter" }, { label: "Produtos" }]}
      />

      <Card className="overflow-hidden pb-0">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-base">Catálogo</CardTitle>
          <CardDescription>
            {products.length} {products.length === 1 ? "produto" : "produtos"}{" "}
            cadastrado{products.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Produto
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Unid.
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                    Último preço
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Última compra
                  </TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-muted-foreground">
                    Pedidos
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-sm text-muted-foreground"
                    >
                      Nenhum produto cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {p.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {p.lastPrice != null
                          ? currency.format(p.lastPrice)
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {formatDate(p.lastOrderedAt)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {p._count.orderItems}
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
