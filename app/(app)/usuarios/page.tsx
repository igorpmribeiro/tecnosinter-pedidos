import Link from "next/link";
import { Plus, Shield, User as UserIcon } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
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
import { requireAdmin } from "@/lib/auth/dal";
import { DeleteUserButton } from "./delete-user-button";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao sistema.
          </p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Link>
        </Button>
      </div>

      <Card className="pb-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Todos os usuários</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "usuário" : "usuários"} cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="w-12 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isAdmin = u.role === "ADMIN";
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          isAdmin
                            ? "inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            : "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {isAdmin ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <UserIcon className="h-3 w-3" />
                        )}
                        {isAdmin ? "Administrador" : "Funcionário"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id !== me.id && (
                        <DeleteUserButton userId={u.id} userName={u.name} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
