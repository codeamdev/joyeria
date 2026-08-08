import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-ink">Nuevo producto</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
