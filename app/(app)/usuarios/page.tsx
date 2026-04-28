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
import { PageHeader } from "@/components/page-header";
import { DeleteUserButton } from "./delete-user-button";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const employeeCount = users.length - adminCount;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usuários"
        description="Gerencie quem tem acesso ao sistema e seus papéis."
        breadcrumbs={[{ label: "Tecnosinter" }, { label: "Usuários" }]}
        actions={
          <Button asChild>
            <Link href="/usuarios/novo">
              <Plus className="h-4 w-4" aria-hidden />
              Novo usuário
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden pb-0">
        <CardHeader className="border-b border-border bg-muted/40">
          <CardTitle className="text-base">Equipe</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "usuário" : "usuários"} ·{" "}
            {adminCount} {adminCount === 1 ? "administrador" : "administradores"}{" "}
            · {employeeCount}{" "}
            {employeeCount === 1 ? "funcionário" : "funcionários"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Pessoa
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Papel
                  </TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Cadastrado em
                  </TableHead>
                  <TableHead className="w-12 text-right" aria-label="Ações" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isAdmin = u.role === "ADMIN";
                  const isMe = u.id === me.id;
                  return (
                    <TableRow
                      key={u.id}
                      className="border-border transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15"
                            aria-hidden
                          >
                            {initials(u.name)}
                          </span>
                          <div className="leading-tight">
                            <div className="font-medium">
                              {u.name}
                              {isMe && (
                                <span className="ml-2 inline-flex items-center rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
                                  Você
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isAdmin
                              ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15"
                              : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/70 ring-1 ring-border"
                          }
                        >
                          {isAdmin ? (
                            <Shield className="h-3 w-3" aria-hidden />
                          ) : (
                            <UserIcon className="h-3 w-3" aria-hidden />
                          )}
                          {isAdmin ? "Administrador" : "Funcionário"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isMe && (
                          <DeleteUserButton userId={u.id} userName={u.name} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
