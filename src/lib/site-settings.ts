import { prisma } from "@/lib/prisma";

export async function getOrCreateSiteSettings() {
  const existing = await prisma.siteSettings.findFirst();
  if (existing) return existing;
  return prisma.siteSettings.create({ data: {} });
}
