"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionSession } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";

const statusSchema = z.enum(["NEW", "IN_PROGRESS", "CLOSED"]);

export async function updateContactMessageStatus(id: string, status: string) {
  const session = await requireActionSession();
  const parsedStatus = statusSchema.parse(status);

  await prisma.contactMessage.update({ where: { id }, data: { status: parsedStatus } });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "ContactMessage",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { status: parsedStatus },
  });

  revalidatePath("/admin/inquiries");
  return {};
}

export async function updateCustomOrderStatus(id: string, status: string) {
  const session = await requireActionSession();
  const parsedStatus = statusSchema.parse(status);

  await prisma.customOrderRequest.update({ where: { id }, data: { status: parsedStatus } });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "CustomOrderRequest",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
    changes: { status: parsedStatus },
  });

  revalidatePath("/admin/inquiries");
  return {};
}
