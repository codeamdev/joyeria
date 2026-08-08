import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/validation/admin-user";
import { CreateUserDialog, EditUserDialog, ResetPasswordDialog } from "./user-dialogs";

export const metadata = { title: "Usuarios" };

export default async function UsersPage() {
  await requirePageRole("ADMIN");
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Usuarios administradores</h1>
        <CreateUserDialog
          trigger={
            <Button>
              <Plus size={16} /> Nuevo usuario
            </Button>
          }
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Último acceso</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                <td className="px-4 py-3 text-ink/60">{user.email}</td>
                <td className="px-4 py-3 text-ink/60">{ROLE_LABELS[user.role]}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                  {user.lockedUntil && user.lockedUntil > new Date() ? (
                    <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                      Bloqueado
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {user.lastLoginAt
                    ? user.lastLoginAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                    : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <EditUserDialog
                      user={user}
                      trigger={
                        <button className="text-xs text-ink/60 hover:text-ink hover:underline">Editar</button>
                      }
                    />
                    <ResetPasswordDialog
                      userId={user.id}
                      userName={user.name}
                      trigger={
                        <button className="text-xs text-ink/60 hover:text-ink hover:underline">Contraseña</button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
