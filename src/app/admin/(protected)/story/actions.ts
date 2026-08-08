"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionRole } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { storySectionSchema } from "@/lib/validation/site-settings";
import { flattenErrors } from "@/lib/validation/flatten-errors";

export type StoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export async function createStorySection(
  _prevState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = storySectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const data = parsed.data;

  const section = await prisma.storySection.create({
    data: {
      order: data.order,
      title: data.title,
      body: data.body,
      imageUrl: toNullable(data.imageUrl),
      videoUrl: toNullable(data.videoUrl),
    },
  });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "CREATE",
    entityType: "StorySection",
    entityId: section.id,
    adminUserId: session.user.id,
    ipAddress: ip,
  });

  revalidatePath("/admin/story");
  revalidatePath("/nuestra-historia");
  revalidatePath("/");
  return {};
}

export async function updateStorySection(
  id: string,
  _prevState: StoryFormState,
  formData: FormData,
): Promise<StoryFormState> {
  const session = await requireActionRole("ADMIN");
  const parsed = storySectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const data = parsed.data;

  await prisma.storySection.update({
    where: { id },
    data: {
      order: data.order,
      title: data.title,
      body: data.body,
      imageUrl: toNullable(data.imageUrl),
      videoUrl: toNullable(data.videoUrl),
    },
  });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "UPDATE",
    entityType: "StorySection",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
  });

  revalidatePath("/admin/story");
  revalidatePath("/nuestra-historia");
  revalidatePath("/");
  return {};
}

export async function deleteStorySection(id: string): Promise<{ error?: string }> {
  const session = await requireActionRole("ADMIN");
  await prisma.storySection.delete({ where: { id } });

  const ip = getClientIp(await headers());
  await logAudit({
    action: "DELETE",
    entityType: "StorySection",
    entityId: id,
    adminUserId: session.user.id,
    ipAddress: ip,
  });

  revalidatePath("/admin/story");
  revalidatePath("/nuestra-historia");
  revalidatePath("/");
  return {};
}
