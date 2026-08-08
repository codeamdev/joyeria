import { prisma } from "@/lib/prisma";

export async function getOrCreateHeroConfig() {
  const existing = await prisma.heroConfig.findFirst({
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;
  return prisma.heroConfig.create({ data: {}, include: { images: true } });
}

export type HeroDisplayType = "video" | "carousel" | "none";

// Regla de negocio: si hay video, se muestra el video y se ignora el
// carrusel. Se deriva siempre a partir de los datos reales — nunca se
// persiste — para que jamás pueda quedar desincronizado.
export function resolveHeroDisplayType(hero: { videoUrl: string | null; images: unknown[] }): HeroDisplayType {
  if (hero.videoUrl) return "video";
  if (hero.images.length > 0) return "carousel";
  return "none";
}
