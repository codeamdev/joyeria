import { requirePageRole } from "@/lib/admin-auth";
import { getOrCreateHeroConfig, resolveHeroDisplayType } from "@/lib/hero";
import { HeroManager } from "./hero-manager";

export const metadata = { title: "Hero de inicio" };

export default async function HeroConfigPage() {
  await requirePageRole("ADMIN");
  const hero = await getOrCreateHeroConfig();
  const displayType = resolveHeroDisplayType(hero);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-2xl text-ink">Hero de inicio</h1>
      <p className="mt-1 text-sm text-ink/60">
        Si hay un video cargado, se muestra el video y se ignora el carrusel. Sube un set de
        imágenes para el carrusel o un video — puedes alternar subiendo o eliminando el video.
      </p>

      <div className="mt-4 inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink/70">
        Mostrando actualmente:{" "}
        {displayType === "video" ? "Video" : displayType === "carousel" ? "Carrusel" : "Nada configurado"}
      </div>

      <div className="mt-6">
        <HeroManager
          videoUrl={hero.videoUrl}
          images={hero.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText ?? "" }))}
        />
      </div>
    </div>
  );
}
