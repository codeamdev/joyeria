"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { requireActionRole } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/request-ip";
import { getOrCreateHeroConfig } from "@/lib/hero";

async function auditAndRevalidate(
  adminUserId: string,
  action: "UPDATE",
  changes: Prisma.InputJsonValue,
) {
  const ip = getClientIp(await headers());
  await logAudit({
    action,
    entityType: "HeroConfig",
    adminUserId,
    ipAddress: ip,
    changes,
  });
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function setHeroVideo(url: string, posterUrl?: string | null) {
  const session = await requireActionRole("ADMIN");
  const hero = await getOrCreateHeroConfig();

  // Uploading video replaces the image carousel (per spec: "reemplazo automático de imágenes previas").
  await prisma.$transaction([
    prisma.heroImage.deleteMany({ where: { heroConfigId: hero.id } }),
    prisma.heroConfig.update({
      where: { id: hero.id },
      data: { videoUrl: url, videoPosterUrl: posterUrl ?? null },
    }),
  ]);

  await auditAndRevalidate(session.user.id, "UPDATE", { videoUrl: url });
  return {};
}

export async function removeHeroVideo() {
  const session = await requireActionRole("ADMIN");
  const hero = await getOrCreateHeroConfig();

  await prisma.heroConfig.update({
    where: { id: hero.id },
    data: { videoUrl: null, videoPosterUrl: null },
  });

  await auditAndRevalidate(session.user.id, "UPDATE", { videoUrl: null });
  return {};
}

export async function addHeroImages(images: Array<{ url: string; altText?: string }>) {
  const session = await requireActionRole("ADMIN");
  const hero = await getOrCreateHeroConfig();

  const maxOrder = await prisma.heroImage.aggregate({
    where: { heroConfigId: hero.id },
    _max: { order: true },
  });
  let nextOrder = (maxOrder._max.order ?? -1) + 1;

  await prisma.heroImage.createMany({
    data: images.map((image) => ({
      heroConfigId: hero.id,
      url: image.url,
      altText: image.altText || null,
      order: nextOrder++,
    })),
  });

  await auditAndRevalidate(session.user.id, "UPDATE", { addedImages: images.length });
  return {};
}

export async function reorderHeroImages(orderedIds: string[]) {
  const session = await requireActionRole("ADMIN");
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.heroImage.update({ where: { id }, data: { order: index } }),
    ),
  );
  await auditAndRevalidate(session.user.id, "UPDATE", { reordered: true });
  return {};
}

export async function removeHeroImage(id: string) {
  const session = await requireActionRole("ADMIN");
  await prisma.heroImage.delete({ where: { id } });
  await auditAndRevalidate(session.user.id, "UPDATE", { removedImage: id });
  return {};
}

export async function updateHeroImageAlt(id: string, altText: string) {
  const session = await requireActionRole("ADMIN");
  await prisma.heroImage.update({ where: { id }, data: { altText: altText || null } });
  await auditAndRevalidate(session.user.id, "UPDATE", { updatedAlt: id });
  return {};
}
