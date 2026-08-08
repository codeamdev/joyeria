import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm, type ProductFormInitialValues } from "../product-form";

export const metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        gemstones: true,
        images: { orderBy: { order: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const initialValues: ProductFormInitialValues = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    categoryId: product.categoryId,
    material: product.material,
    purity: product.purity ?? "",
    weightGrams: product.weightGrams ? Number(product.weightGrams) : null,
    price: Number(product.price),
    internalCost: product.internalCost ? Number(product.internalCost) : null,
    isOneOfAKind: product.isOneOfAKind,
    isCustomizable: product.isCustomizable,
    productionTimeDays: product.productionTimeDays,
    status: product.status,
    careInstructions: product.careInstructions ?? "",
    ringSize: product.ringSize ?? "",
    chainLengthCm: product.chainLengthCm ? Number(product.chainLengthCm) : null,
    braceletLengthCm: product.braceletLengthCm ? Number(product.braceletLengthCm) : null,
    dimensionsNote: product.dimensionsNote ?? "",
    certifyingEntity: product.certifyingEntity ?? "",
    certificationNumber: product.certificationNumber ?? "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    featured: product.featured,
    gemstones: product.gemstones.map((g) => ({
      id: g.id,
      type: g.type,
      carat: g.carat ? Number(g.carat) : null,
      color: g.color ?? "",
      clarity: g.clarity ?? "",
      cut: g.cut ?? "",
      quantity: g.quantity,
    })),
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      order: img.order,
      isMain: img.isMain,
      altText: img.altText ?? "",
    })),
  };

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Editar producto</h1>
      <ProductForm mode="edit" categories={categories} initialValues={initialValues} />
    </div>
  );
}
