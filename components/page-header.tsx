import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Crumb = { label: string; href?: string };

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  backHref?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  meta,
  actions,
}: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Navegação estrutural">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                {breadcrumbs.map((b, i) => (
                  <li key={`${b.label}-${i}`} className="flex items-center gap-1">
                    {i > 0 && <span aria-hidden>/</span>}
                    {b.href ? (
                      <Link
                        href={b.href}
                        className="rounded-sm px-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {b.label}
                      </Link>
                    ) : (
                      <span className="px-1 py-0.5 text-foreground/80">
                        {b.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Voltar
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              {title}
            </h1>
            {meta}
          </div>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
