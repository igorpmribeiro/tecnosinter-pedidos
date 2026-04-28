import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/auth/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ name: user.name, role: user.role }} />
      <main className="flex-1 overflow-x-auto">
        <div className="mx-auto w-full max-w-6xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
