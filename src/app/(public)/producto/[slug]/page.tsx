import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateSiteSettings } from "@/lib/site-settings";
import { formatPrice } from "@/lib/format-price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MATERIAL_LABELS, STATUS_LABELS } from "@/lib/validation/product";
import { ProductGallery } from "@/components/public/product-gallery";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      material: true,
      purity: true,
      weightGrams: true,
      price: true,
      isOneOfAKind: true,
      isCustomizable: true,
      productionTimeDays: true,
      status: true,
      careInstructions: true,
      ringSize: true,
      chainLengthCm: true,
      braceletLengthCm: true,
      dimensionsNote: true,
      certifyingEntity: true,
      certificationNumber: true,
      metaTitle: true,
      metaDescription: true,
      category: { select: { id: true, name: true, slug: true } },
      gemstones: { select: { type: true, carat: true, color: true, clarity: true, cut: true, quantity: true } },
      images: { orderBy: { order: "asc" }, select: { url: true, altText: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getOrCreateSiteSettings()]);

  if (!product) notFound();

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hola, me interesa la pieza "${product.name}" (${product.slug}). ¿Sigue disponible?`,
  );

  const dimensionEntries = [
    product.ringSize ? { label: "Talla de anillo", value: product.ringSize } : null,
    product.chainLengthCm ? { label: "Longitud de cadena", value: `${product.chainLengthCm} cm` } : null,
    product.braceletLengthCm ? { label: "Longitud de pulsera", value: `${product.braceletLengthCm} cm` } : null,
    product.dimensionsNote ? { label: "Otras medidas", value: product.dimensionsNote } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-ink/50">
        <Link href="/catalogo" className="hover:text-gold">
          Catálogo
        </Link>
        {" / "}
        <Link href={`/catalogo?categoryId=${product.category.id}`} className="hover:text-gold">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.isOneOfAKind ? (
            <span className="inline-block rounded-full bg-ink px-3 py-1 text-xs uppercase tracking-wide text-ivory">
              Pieza única
            </span>
          ) : null}
          <h1 className="mt-3 font-serif text-3xl text-ink">{product.name}</h1>
          {product.shortDescription ? <p className="mt-2 text-ink/70">{product.shortDescription}</p> : null}
          <p className="mt-4 text-2xl font-medium text-ink">{formatPrice(product.price.toString(), settings.currency)}</p>
          <p className="mt-1 text-sm text-ink/50">{STATUS_LABELS[product.status]}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Consultar por WhatsApp
              </a>
            ) : null}
            {product.isCustomizable ? (
              <Link
                href={`/personalizacion?ref=${product.slug}`}
                className="rounded-md border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition hover:bg-surface"
              >
                Solicitar personalización
              </Link>
            ) : null}
          </div>

          <div className="mt-10 border-t border-ink/10 pt-6">
            <h2 className="font-serif text-lg text-ink">Ficha técnica</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink/50">Material</dt>
              <dd className="text-ink/80">
                {MATERIAL_LABELS[product.material]}
                {product.purity ? ` · ${product.purity}` : ""}
              </dd>
              {product.weightGrams ? (
                <>
                  <dt className="text-ink/50">Peso</dt>
                  <dd className="text-ink/80">{product.weightGrams.toString()} g</dd>
                </>
              ) : null}
              {dimensionEntries.map((entry) => (
                <Fragment key={entry.label}>
                  <dt className="text-ink/50">{entry.label}</dt>
                  <dd className="text-ink/80">{entry.value}</dd>
                </Fragment>
              ))}
              {product.isCustomizable && product.productionTimeDays ? (
                <>
                  <dt className="text-ink/50">Tiempo de producción</dt>
                  <dd className="text-ink/80">{product.productionTimeDays} días aprox.</dd>
                </>
              ) : null}
            </dl>

            {product.gemstones.length > 0 ? (
              <div className="mt-5">
                <p className="text-sm font-medium text-ink/70">Piedras</p>
                <ul className="mt-2 space-y-1 text-sm text-ink/70">
                  {product.gemstones.map((gem, i) => (
                    <li key={i}>
                      {gem.quantity > 1 ? `${gem.quantity}× ` : ""}
                      {gem.type}
                      {gem.carat ? ` · ${gem.carat} ct` : ""}
                      {gem.color ? ` · ${gem.color}` : ""}
                      {gem.clarity ? ` · claridad ${gem.clarity}` : ""}
                      {gem.cut ? ` · corte ${gem.cut}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.certifyingEntity ? (
              <p className="mt-5 text-sm text-ink/60">
                Certificado por {product.certifyingEntity}
                {product.certificationNumber ? ` (N.º ${product.certificationNumber})` : ""}.
              </p>
            ) : null}
          </div>

          {product.description ? (
            <div className="mt-8 border-t border-ink/10 pt-6">
              <h2 className="font-serif text-lg text-ink">Descripción</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
                {product.description}
              </p>
            </div>
          ) : null}

          {product.careInstructions ? (
            <div className="mt-8 border-t border-ink/10 pt-6">
              <h2 className="font-serif text-lg text-ink">Cuidados</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
                {product.careInstructions}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
