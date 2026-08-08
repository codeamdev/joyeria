import { prisma } from "@/lib/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

type LogAuditInput = {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  adminUserId?: string | null;
  changes?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

// Nunca debe tumbar la mutación que la originó: un fallo al auditar se registra
// en consola pero no interrumpe la operación de negocio.
export async function logAudit(input: LogAuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        adminUserId: input.adminUserId ?? null,
        changes: input.changes,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("No se pudo escribir el audit log", err);
  }
}
