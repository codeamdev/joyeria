import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/admin-auth";

export const metadata = { title: "Auditoría" };

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Creación",
  UPDATE: "Modificación",
  DELETE: "Eliminación",
  LOGIN: "Inicio de sesión",
  LOGIN_FAILED: "Intento fallido",
  LOGOUT: "Cierre de sesión",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePageRole("ADMIN");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 50;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { adminUser: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Auditoría</h1>
      <p className="mt-1 text-sm text-ink/60">Registro de cambios sensibles: quién, qué y cuándo.</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Acción</th>
              <th className="px-4 py-3 font-medium">Entidad</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-ink/5 last:border-0 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                  {entry.createdAt.toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3 text-ink/70">{entry.adminUser?.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">{ACTION_LABELS[entry.action] ?? entry.action}</td>
                <td className="px-4 py-3 text-ink/70">
                  {entry.entityType}
                  {entry.entityId ? <span className="text-ink/40"> · {entry.entityId.slice(0, 8)}</span> : null}
                </td>
                <td className="px-4 py-3 text-ink/50">{entry.ipAddress ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Sin registros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-ink/60">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <a href={`?page=${page - 1}`} className="hover:text-ink hover:underline">
                Anterior
              </a>
            ) : null}
            {page < totalPages ? (
              <a href={`?page=${page + 1}`} className="hover:text-ink hover:underline">
                Siguiente
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
