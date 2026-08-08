import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryRowActions } from "./category-row-actions";

export const metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { parent: true, _count: { select: { products: true, children: true } } },
  });

  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Categorías</h1>
        <CategoryFormDialog
          mode="create"
          parentOptions={parentOptions}
          trigger={
            <Button>
              <Plus size={16} /> Nueva categoría
            </Button>
          }
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Padre</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{category.name}</td>
                <td className="px-4 py-3 text-ink/60">{category.slug}</td>
                <td className="px-4 py-3 text-ink/60">{category.parent?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/60">{category.order}</td>
                <td className="px-4 py-3 text-ink/60">{category._count.products}</td>
                <td className="px-4 py-3">
                  <CategoryRowActions category={category} parentOptions={parentOptions} />
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  No hay categorías todavía.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
