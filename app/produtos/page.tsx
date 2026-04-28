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

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const products = await db.product.findMany({
    orderBy: [{ lastOrderedAt: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { orderItems: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground">
          Histórico de produtos pedidos. Os produtos são cadastrados
          automaticamente ao serem usados em um pedido.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
          <CardDescription>
            {products.length} {products.length === 1 ? "produto" : "produtos"}{" "}
            cadastrado{products.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Unid.</TableHead>
                <TableHead className="text-right">Último preço</TableHead>
                <TableHead>Última compra</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum produto cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{p.unit}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {p.lastPrice != null ? currency.format(p.lastPrice) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{formatDate(p.lastOrderedAt)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {p._count.orderItems}
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
