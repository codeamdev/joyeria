import type { Metadata } from "next";
import type { MaterialType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { ProductCard } from "@/components/public/product-card";
import { CatalogFilters } from "./catalog-filters";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora nuestra colección de joyería artesanal en oro y plata.",
};

type SearchParams = {
  q?: string;
  categoryId?: string;
  material?: string;
  gemstone?: string;
  minPrice?: string;
  maxPrice?: string;
  unique?: string;
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = {
    AND: [
      params.q ? { name: { contains: params.q, mode: "insensitive" } } : {},
      params.categoryId ? { categoryId: params.categoryId } : {},
      params.material ? { material: params.material as MaterialType } : {},
      params.gemstone ? { gemstones: { some: { type: params.gemstone } } } : {},
      params.unique === "1" ? { isOneOfAKind: true } : {},
      params.minPrice ? { price: { gte: Number(params.minPrice) } } : {},
      params.maxPrice ? { price: { lte: Number(params.maxPrice) } } : {},
    ],
  };

  const [products, categories, gemstoneTypesRaw, settings] = await Promise.all([
    prisma.product.findMany({
      where,
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
      take: 200,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.gemstone.findMany({ distinct: ["type"], select: { type: true }, orderBy: { type: "asc" } }),
    getOrCreateSiteSettings(),
  ]);

  const gemstoneTypes = gemstoneTypesRaw.map((g) => g.type);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl text-ink">Catálogo</h1>
      <p className="mt-1 text-ink/60">
        {products.length} pieza{products.length === 1 ? "" : "s"} de fabricación artesanal propia.
      </p>

      <div className="mt-6">
        <CatalogFilters categories={categories} gemstoneTypes={gemstoneTypes} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
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

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink/50">No hay piezas que coincidan con estos filtros.</p>
      ) : null}
    </div>
  );
}
