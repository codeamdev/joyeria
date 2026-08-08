import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateHeroConfig, resolveHeroDisplayType } from "@/lib/hero";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { HeroCarousel, HeroVideo } from "@/components/public/hero-display";
import { ProductCard } from "@/components/public/product-card";

export default async function HomePage() {
  const [hero, settings, featuredProducts] = await Promise.all([
    getOrCreateHeroConfig(),
    getOrCreateSiteSettings(),
    prisma.product.findMany({
      where: { featured: true },
      select: {
        slug: true,
        name: true,
        price: true,
        material: true,
        purity: true,
        isOneOfAKind: true,
        status: true,
        images: { where: { isMain: true }, take: 1, select: { url: true, altText: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const displayType = resolveHeroDisplayType(hero);

  return (
    <div>
      <section className="relative h-[70vh] min-h-[420px] w-full bg-ink">
        {displayType === "video" && hero.videoUrl ? (
          <HeroVideo url={hero.videoUrl} posterUrl={hero.videoPosterUrl} />
        ) : displayType === "carousel" ? (
          <HeroCarousel
            images={hero.images.map((img) => ({ id: img.id, url: img.url, altText: img.altText }))}
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/30 px-4 text-center">
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">Joyería y Platería AJ</h1>
          <p className="mt-3 max-w-md text-ivory/85">
            Joyería artesanal en oro y plata. Fabricación propia, piezas únicas y personalización
            por encargo.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 rounded-md bg-ivory px-6 py-3 text-sm font-medium text-ink transition hover:bg-gold hover:text-ivory"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      {featuredProducts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-serif text-2xl text-ink">Piezas destacadas</h2>
            <Link href="/catalogo" className="text-sm text-ink/60 hover:text-gold">
              Ver todo el catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                currency={settings.currency}
                product={{
                  slug: product.slug,
                  name: product.name,
                  price: product.price.toString(),
                  material: product.material,
                  purity: product.purity,
                  isOneOfAKind: product.isOneOfAKind,
                  status: product.status,
                  imageUrl: product.images[0]?.url ?? null,
                  imageAlt: product.images[0]?.altText ?? null,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {settings.storyTitle || settings.storyIntro ? (
        <section className="bg-surface/60">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="font-serif text-2xl text-ink">{settings.storyTitle ?? "Nuestra historia"}</h2>
            {settings.storyIntro ? <p className="mt-4 text-ink/70">{settings.storyIntro}</p> : null}
            <Link
              href="/nuestra-historia"
              className="mt-6 inline-block text-sm font-medium text-gold hover:underline"
            >
              Conoce nuestro proceso artesanal →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-serif text-2xl text-ink">¿Buscas una pieza única?</h2>
        <p className="mt-3 text-ink/70">
          Diseñamos y fabricamos piezas a la medida: cuéntanos tu idea y la hacemos realidad en oro
          o plata.
        </p>
        <Link
          href="/personalizacion"
          className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-medium text-ivory transition hover:bg-gold"
        >
          Solicitar pieza personalizada
        </Link>
      </section>
    </div>
  );
}
