"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Package,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/login/actions";

type SidebarUser = {
  name: string;
  role: "ADMIN" | "FUNCIONARIO";
};

const baseLinks = [
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/motivos", label: "Motivos", icon: FileText },
];

const adminLinks = [{ href: "/usuarios", label: "Usuários", icon: Users }];

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const links = user.role === "ADMIN" ? [...baseLinks, ...adminLinks] : baseLinks;
  const roleLabel = user.role === "ADMIN" ? "Administrador" : "Funcionário";

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/pedidos" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            T
          </div>
          <span className="font-semibold">Tecnosinter</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="px-2 pb-2 text-xs">
          <p className="truncate font-medium">{user.name}</p>
          <p className="text-muted-foreground">{roleLabel}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
