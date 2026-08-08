import Link from "next/link";
import type { AdminRole } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { SignOutButton } from "./sign-out-button";

const NAV_ITEMS: Array<{ href: string; label: string; roles: AdminRole[] }> = [
  { href: "/admin", label: "Panel", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/products", label: "Productos", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/categories", label: "Categorías", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/inquiries", label: "Solicitudes", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/hero", label: "Hero de inicio", roles: ["ADMIN"] },
  { href: "/admin/story", label: "Nuestra historia", roles: ["ADMIN"] },
  { href: "/admin/settings", label: "Configuración", roles: ["ADMIN"] },
  { href: "/admin/users", label: "Usuarios", roles: ["ADMIN"] },
  { href: "/admin/audit-log", label: "Auditoría", roles: ["ADMIN"] },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  const role = session.user.role;
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="w-60 shrink-0 border-r border-ink/10 bg-white/50 px-4 py-6">
        <p className="mb-6 font-serif text-lg text-ink">Joyería AJ</p>
        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-ink/75 hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-ink/10 pt-4">
          <p className="px-3 text-xs text-ink/50">{session.user.email}</p>
          <p className="px-3 text-xs text-ink/50">
            {role === "ADMIN" ? "Administrador" : "Editor"}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
