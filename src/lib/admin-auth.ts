import "server-only";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { auth } from "@/auth";
import type { Session } from "next-auth";

// Segunda capa de autorización (la primera es src/proxy.ts). Se llama en
// layouts/páginas Y en cada Server Action — el proxy solo protege la red,
// nunca la lógica de negocio.
export async function requireAdminSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

export async function requirePageRole(role: AdminRole): Promise<Session> {
  const session = await requireAdminSession();
  if (session.user.role !== role) {
    redirect("/admin");
  }
  return session;
}

export class ForbiddenError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Para usar dentro de Server Actions: nunca confiar en que la UI ocultó el botón.
export async function requireActionRole(role: AdminRole): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new ForbiddenError("Sesión requerida");
  }
  if (session.user.role !== role) {
    throw new ForbiddenError("Rol insuficiente");
  }
  return session;
}

export async function requireActionSession(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new ForbiddenError("Sesión requerida");
  }
  return session;
}
