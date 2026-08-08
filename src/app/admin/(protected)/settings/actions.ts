"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionRole } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { siteSettingsSchema } from "@/lib/validation/site-settings";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type SettingsFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;
  const current = await getOrCreateSiteSettings();

  await prisma.siteSettings.update({
    where: { id: current.id },
    data: {
      whatsappNumber: toNullable(data.whatsappNumber),
      contactEmail: toNullable(data.contactEmail),
      contactPhone: toNullable(data.contactPhone),
      address: toNullable(data.address),
      storyTitle: toNullable(data.storyTitle),
      storyIntro: toNullable(data.storyIntro),
      instagramUrl: toNullable(data.instagramUrl),
      facebookUrl: toNullable(data.facebookUrl),
      tiktokUrl: toNullable(data.tiktokUrl),
      currency: data.currency.toUpperCase(),
    },
  });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "SiteSettings",
    entityId: current.id,
    adminUserId: session.user.id,
    ipAddress: ip,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contacto");
  return { success: true };
}
