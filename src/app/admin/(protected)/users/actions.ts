"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionRole } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import {
  createAdminUserSchema,
  resetPasswordSchema,
  updateAdminUserSchema,
} from "@/lib/validation/admin-user";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type UserFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createAdminUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = createAdminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const data = parsed.data;

  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const user = await prisma.adminUser.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
    });

    const ip = getClientIp(await headers());
    await logAudit({
      action: "CREATE",
      entityType: "AdminUser",
      entityId: user.id,
      adminUserId: session.user.id,
      ipAddress: ip,
      changes: { email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Ya existe un usuario con ese correo" };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return {};
}

async function assertNotRemovingLastAdmin(targetId: string, nextIsActive: boolean, nextRole: string) {
  const willStillBeActiveAdmin = nextIsActive && nextRole === "ADMIN";
  if (willStillBeActiveAdmin) return;

  const target = await prisma.adminUser.findUnique({ where: { id: targetId } });
  if (!target || target.role !== "ADMIN" || !target.isActive) return;

  const otherActiveAdmins = await prisma.adminUser.count({
    where: { role: "ADMIN", isActive: true, id: { not: targetId } },
  });
  if (otherActiveAdmins === 0) {
    throw new Error("No puedes quitar al último administrador activo");
  }
}

export async function updateAdminUser(
  id: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = updateAdminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const data = parsed.data;

  try {
    await assertNotRemovingLastAdmin(id, data.isActive, data.role);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No autorizado" };
  }

  await prisma.adminUser.update({
    where: { id },
    data: { name: data.name, role: data.role, isActive: data.isActive },
  });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "AdminUser",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { role: data.role, isActive: data.isActive },
  });

  revalidatePath("/admin/users");
  return {};
}

export async function resetAdminUserPassword(
  id: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.adminUser.update({
    where: { id },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "AdminUser",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { passwordReset: true },
  });

  revalidatePath("/admin/users");
  return {};
}
