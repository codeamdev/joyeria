import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format-price";
import { STATUS_LABELS } from "@/lib/validation/product";
import { ProductRowActions } from "./product-row-actions";
import { ProductsFilterBar } from "./products-filter-bar";

export const metadata = { title: "Productos" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string }>;
}) {
  const params = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        params.q
          ? {
              OR: [
                { name: { contains: params.q, mode: "insensitive" } },
                { sku: { contains: params.q, mode: "insensitive" } },
              ],
            }
          : {},
        params.status ? { status: params.status as never } : {},
        params.categoryId ? { categoryId: params.categoryId } : {},
      ],
    },
    include: {
      category: true,
      images: { where: { isMain: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Productos</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={16} /> Nuevo producto
          </Button>
        </Link>
      </div>

      <ProductsFilterBar categories={categories} />

      <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-white/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link href={`/admin/products/${product.id}`} className="hover:text-gold">
                    {product.name}
                  </Link>
                  {product.featured ? (
                    <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-[10px] text-gold">
                      Destacado
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-ink/60">{product.sku}</td>
                <td className="px-4 py-3 text-ink/60">{product.category.name}</td>
                <td className="px-4 py-3 text-ink/60">{formatPrice(product.price.toString())}</td>
                <td className="px-4 py-3 text-ink/60">{STATUS_LABELS[product.status]}</td>
                <td className="px-4 py-3">
                  <ProductRowActions productId={product.id} productName={product.name} />
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  No hay productos con esos filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
