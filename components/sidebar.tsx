"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Package, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/motivos", label: "Motivos", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-background md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/pedidos" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            T
          </div>
          <span className="font-semibold">Tecnosinter</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
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
    </aside>
  );
}
