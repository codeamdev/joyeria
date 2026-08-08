import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format-price";
import { MATERIAL_LABELS } from "@/lib/validation/product";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string | number;
  material: keyof typeof MATERIAL_LABELS;
  purity: string | null;
  isOneOfAKind: boolean;
  status: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export function ProductCard({ product, currency }: { product: ProductCardData; currency?: string }) {
  const unavailable = product.status === "VENDIDO";

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-ink/10 bg-white/50 transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
        {product.isOneOfAKind ? (
          <span className="absolute left-2 top-2 rounded-full bg-ink/85 px-2 py-1 text-[10px] uppercase tracking-wide text-ivory">
            Pieza única
          </span>
        ) : null}
        {unavailable ? (
          <span className="absolute right-2 top-2 rounded-full bg-red-800/85 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
            Vendido
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-serif text-base text-ink">{product.name}</p>
        <p className="mt-0.5 text-xs text-ink/50">
          {MATERIAL_LABELS[product.material]}
          {product.purity ? ` · ${product.purity}` : ""}
        </p>
        <p className="mt-1.5 text-sm font-medium text-ink">{formatPrice(product.price, currency)}</p>
      </div>
    </Link>
  );
}
